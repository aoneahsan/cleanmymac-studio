import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { registerScannerHandlers } from '../src/main/ipc/scanner';
import { registerDiskHealthHandlers } from '../src/main/ipc/diskHealth';
import { registerAppUninstallerHandlers } from '../src/main/ipc/appUninstaller';
import { registerPrivacyCleanerHandlers } from '../src/main/ipc/privacyCleaner';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV !== 'production';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'hiddenInset',
    show: false
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

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

// Register IPC handlers
registerScannerHandlers();
registerDiskHealthHandlers();
registerAppUninstallerHandlers();
registerPrivacyCleanerHandlers();