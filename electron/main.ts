import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, type ChildProcess } from 'child_process';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;
let llamaProcess: ChildProcess | null = null;

const MODELS_DIR = path.join(app.getPath('userData'), 'models');
const SERVER_PORT = 3001;
const LLAMA_PORT = 11434;

// Ensure directories exist
function ensureDirs() {
  for (const dir of [MODELS_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

// ── Start the Express backend server ─────────────────────────
function startServer() {
  const serverPath = isDev
    ? path.join(__dirname, '../server/src/index.ts')
    : path.join(process.resourcesPath, 'server', 'dist', 'index.js');

  const cmd = isDev ? 'npx' : 'node';
  const args = isDev ? ['tsx', serverPath] : [serverPath];

  serverProcess = spawn(cmd, args, {
    cwd: isDev ? path.join(__dirname, '..') : path.join(process.resourcesPath, 'server'),
    env: {
      ...process.env,
      PORT: String(SERVER_PORT),
      NODE_ENV: isDev ? 'development' : 'production',
      OLLAMA_HOST: `http://localhost:${LLAMA_PORT}`,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  });

  serverProcess.stdout?.on('data', (data: Buffer) => {
    console.log(`[Server] ${data.toString().trim()}`);
  });

  serverProcess.stderr?.on('data', (data: Buffer) => {
    console.error(`[Server Error] ${data.toString().trim()}`);
  });

  serverProcess.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
  });
}

// ── Start llama.cpp server for local inference ───────────────
function startLlamaServer(modelPath: string) {
  if (llamaProcess) {
    llamaProcess.kill();
    llamaProcess = null;
  }

  // Resolve llama-server binary path
  const binaryName = process.platform === 'win32' ? 'llama-server.exe' : 'llama-server';
  const binaryPath = isDev
    ? path.join(__dirname, '../bin', binaryName)
    : path.join(process.resourcesPath, 'bin', binaryName);

  if (!fs.existsSync(binaryPath)) {
    console.log(`llama-server not found at ${binaryPath}`);
    mainWindow?.webContents.send('llama-status', {
      available: false,
      error: 'llama-server binary not found. Download it from https://github.com/ggerganov/llama.cpp/releases',
    });
    return;
  }

  if (!fs.existsSync(modelPath)) {
    mainWindow?.webContents.send('llama-status', {
      available: false,
      error: `Model file not found: ${modelPath}`,
    });
    return;
  }

  const args = [
    '--model', modelPath,
    '--host', '127.0.0.1',
    '--port', String(LLAMA_PORT),
    '--ctx-size', '4096',
    '--n-gpu-layers', '999', // Offload all layers to GPU if available
    '--parallel', '2',
  ];

  llamaProcess = spawn(binaryPath, args, {
    cwd: path.dirname(binaryPath),
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  llamaProcess.stdout?.on('data', (data: Buffer) => {
    const text = data.toString();
    console.log(`[llama.cpp] ${text.trim()}`);
    if (text.includes('listening')) {
      mainWindow?.webContents.send('llama-status', {
        available: true,
        model: path.basename(modelPath),
        port: LLAMA_PORT,
      });
    }
  });

  llamaProcess.stderr?.on('data', (data: Buffer) => {
    console.error(`[llama.cpp] ${data.toString().trim()}`);
  });

  llamaProcess.on('exit', (code) => {
    console.log(`llama.cpp exited with code ${code}`);
    mainWindow?.webContents.send('llama-status', { available: false });
  });
}

// ── Create the main window ───────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Model Forge',
    icon: path.join(__dirname, '../public/icon.png'),
    backgroundColor: '#000000',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ── IPC Handlers ─────────────────────────────────────────────

ipcMain.handle('get-models-dir', () => MODELS_DIR);

ipcMain.handle('list-local-models', () => {
  if (!fs.existsSync(MODELS_DIR)) return [];
  return fs.readdirSync(MODELS_DIR)
    .filter((f) => f.endsWith('.gguf'))
    .map((f) => ({
      name: f,
      path: path.join(MODELS_DIR, f),
      size: fs.statSync(path.join(MODELS_DIR, f)).size,
    }));
});

ipcMain.handle('load-model', (_, modelFileName: string) => {
  const modelPath = path.join(MODELS_DIR, modelFileName);
  startLlamaServer(modelPath);
  return { success: true };
});

ipcMain.handle('unload-model', () => {
  if (llamaProcess) {
    llamaProcess.kill();
    llamaProcess = null;
  }
  return { success: true };
});

ipcMain.handle('download-model', async (_, url: string, fileName: string) => {
  const destPath = path.join(MODELS_DIR, fileName);

  try {
    const response = await fetch(url, {
      headers: process.env.HF_TOKEN ? { Authorization: `Bearer ${process.env.HF_TOKEN}` } : {},
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const totalSize = parseInt(response.headers.get('content-length') || '0', 10);
    const fileStream = fs.createWriteStream(destPath);
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    let downloaded = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fileStream.write(Buffer.from(value));
      downloaded += value.length;

      const progress = totalSize > 0 ? Math.round((downloaded / totalSize) * 100) : 0;
      mainWindow?.webContents.send('download-progress', {
        fileName,
        downloaded,
        totalSize,
        progress,
      });
    }

    fileStream.end();
    return { success: true, path: destPath };
  } catch (err: unknown) {
    // Clean up partial file
    if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
    return { success: false, error: err instanceof Error ? err.message : 'Download failed' };
  }
});

ipcMain.handle('delete-model', (_, fileName: string) => {
  const modelPath = path.join(MODELS_DIR, fileName);
  if (fs.existsSync(modelPath)) {
    fs.unlinkSync(modelPath);
    return { success: true };
  }
  return { success: false, error: 'File not found' };
});

ipcMain.handle('open-models-folder', () => {
  shell.openPath(MODELS_DIR);
});

ipcMain.handle('select-model-file', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select GGUF Model',
    filters: [{ name: 'GGUF Models', extensions: ['gguf'] }],
    properties: ['openFile'],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('get-app-info', () => ({
  version: app.getVersion(),
  platform: process.platform,
  arch: process.arch,
  electronVersion: process.versions.electron,
  nodeVersion: process.versions.node,
  modelsDir: MODELS_DIR,
  isDev,
}));

// ── App lifecycle ────────────────────────────────────────────
app.whenReady().then(() => {
  ensureDirs();
  startServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (serverProcess) serverProcess.kill();
  if (llamaProcess) llamaProcess.kill();
});