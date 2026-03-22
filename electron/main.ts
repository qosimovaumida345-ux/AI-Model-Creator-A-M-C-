import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'AI Model Creator',
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  });

  // electron/dist/main.js -> electron/dist/ -> electron/ -> root/
  // dist/index.html root/dist/index.html da
  const indexPath = path.join(__dirname, '..', '..', 'dist', 'index.html');
  
  mainWindow.loadFile(indexPath).catch(() => {
    // Agar topilmasa, alternativ yo'l
    const altPath = path.join(app.getAppPath(), 'dist', 'index.html');
    mainWindow?.loadFile(altPath);
  });

  // DevTools ochish — qora ekran sababini ko'rish uchun
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});