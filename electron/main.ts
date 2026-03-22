const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow: any = null;

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

  const indexPath = path.join(__dirname, '..', '..', 'dist', 'index.html');
  mainWindow.loadFile(indexPath).catch((err: any) => {
    console.error('loadFile error:', err);
    const altPath = path.join(app.getAppPath(), 'dist', 'index.html');
    mainWindow?.loadFile(altPath);
  });

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