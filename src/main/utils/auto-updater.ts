import { app, dialog, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';

// Configure logger
autoUpdater.logger = require('electron-log');
(autoUpdater.logger as any).transports.file.level = 'info';

export class AutoUpdater {
  private mainWindow: BrowserWindow | null = null;
  private updateChannel: 'latest' | 'beta' = 'latest';
  private isInitialized = false;

  constructor() {
    // Configure auto-updater
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    
    // Set update feed URL based on platform
    if (process.platform === 'darwin') {
      // For macOS, use GitHub releases or your own update server
      autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'your-github-username',
        repo: 'cleanmymac-pro',
        private: false,
        token: process.env.GH_TOKEN // Optional for private repos
      });
    }
    
    this.setupEventHandlers();
  }

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  private setupEventHandlers() {
    // Update available
    autoUpdater.on('update-available', (info) => {
      console.log('Update available:', info);
      
      if (this.mainWindow) {
        this.mainWindow.webContents.send('update-available', {
          version: info.version,
          releaseDate: info.releaseDate,
          releaseNotes: info.releaseNotes
        });
      }
      
      // Show dialog to user
      dialog.showMessageBox(this.mainWindow!, {
        type: 'info',
        title: 'Update Available',
        message: `A new version (${info.version}) is available. Would you like to download it now?`,
        detail: 'The update will be installed automatically when you quit the app.',
        buttons: ['Download', 'Later'],
        defaultId: 0
      }).then(result => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
    });

    // Update not available
    autoUpdater.on('update-not-available', (info) => {
      console.log('Update not available:', info);
      
      if (this.mainWindow) {
        this.mainWindow.webContents.send('update-not-available');
      }
    });

    // Download progress
    autoUpdater.on('download-progress', (progressObj) => {
      let logMessage = `Download speed: ${progressObj.bytesPerSecond}`;
      logMessage += ` - Downloaded ${progressObj.percent}%`;
      logMessage += ` (${progressObj.transferred}/${progressObj.total})`;
      
      console.log(logMessage);
      
      if (this.mainWindow) {
        this.mainWindow.webContents.send('update-download-progress', {
          bytesPerSecond: progressObj.bytesPerSecond,
          percent: progressObj.percent,
          transferred: progressObj.transferred,
          total: progressObj.total
        });
      }
    });

    // Update downloaded
    autoUpdater.on('update-downloaded', (info) => {
      console.log('Update downloaded:', info);
      
      if (this.mainWindow) {
        this.mainWindow.webContents.send('update-downloaded', {
          version: info.version,
          releaseDate: info.releaseDate,
          releaseNotes: info.releaseNotes
        });
      }
      
      // Show dialog to restart
      dialog.showMessageBox(this.mainWindow!, {
        type: 'info',
        title: 'Update Ready',
        message: 'Update downloaded. The application will restart to apply the update.',
        detail: `Version ${info.version} has been downloaded and will be installed.`,
        buttons: ['Restart Now', 'Install on Quit'],
        defaultId: 0
      }).then(result => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    });

    // Error handling
    autoUpdater.on('error', (error) => {
      console.error('Auto-updater error:', error);
      
      if (this.mainWindow) {
        this.mainWindow.webContents.send('update-error', error.message);
      }
      
      dialog.showErrorBox(
        'Update Error',
        `An error occurred while checking for updates: ${error.message}`
      );
    });
  }

  async checkForUpdates(silent = false): Promise<void> {
    if (!this.isInitialized) {
      console.log('Auto-updater not initialized for this environment');
      return;
    }

    try {
      const result = await autoUpdater.checkForUpdates();
      
      if (!result && !silent) {
        dialog.showMessageBox(this.mainWindow!, {
          type: 'info',
          title: 'No Updates',
          message: 'You are running the latest version.',
          buttons: ['OK']
        });
      }
    } catch (error) {
      console.error('Check for updates failed:', error);
      
      if (!silent) {
        dialog.showErrorBox(
          'Update Check Failed',
          'Unable to check for updates. Please try again later.'
        );
      }
    }
  }

  setUpdateChannel(channel: 'latest' | 'beta') {
    this.updateChannel = channel;
    autoUpdater.channel = channel;
    
    // Save preference
    if (this.mainWindow) {
      this.mainWindow.webContents.send('update-channel-changed', channel);
    }
  }

  getUpdateChannel(): string {
    return this.updateChannel;
  }

  initialize() {
    // Only initialize for production builds outside Mac App Store
    if (process.env.NODE_ENV === 'production' && !process.mas) {
      this.isInitialized = true;
      
      // Check for updates on startup (after 3 seconds)
      setTimeout(() => {
        this.checkForUpdates(true);
      }, 3000);
      
      // Check for updates every 4 hours
      setInterval(() => {
        this.checkForUpdates(true);
      }, 4 * 60 * 60 * 1000);
    }
  }

  // IPC handlers
  registerIpcHandlers() {
    ipcMain.handle('updater:check', async () => {
      await this.checkForUpdates(false);
    });

    ipcMain.handle('updater:download', async () => {
      await autoUpdater.downloadUpdate();
    });

    ipcMain.handle('updater:install', () => {
      autoUpdater.quitAndInstall();
    });

    ipcMain.handle('updater:get-channel', () => {
      return this.updateChannel;
    });

    ipcMain.handle('updater:set-channel', (event, channel: 'latest' | 'beta') => {
      this.setUpdateChannel(channel);
    });

    ipcMain.handle('updater:get-version', () => {
      return app.getVersion();
    });
  }
}

// Export singleton instance
export const updater = new AutoUpdater();