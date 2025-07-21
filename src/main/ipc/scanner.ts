import { ipcMain, BrowserWindow } from 'electron';
import { PreAuthScanner } from '../modules/pre-auth-scanner';
import { AuthenticatedScanner } from '../modules/authenticated-scanner';
import type { ScanProgress, ScanSummary } from '../../shared/types/scan';

export function registerScannerHandlers() {
  const preAuthScanner = new PreAuthScanner();
  const authenticatedScanner = new AuthenticatedScanner();

  // Pre-auth scan handler
  ipcMain.handle('pre-auth-scan', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) throw new Error('Window not found');

    // Progress callback
    const onProgress = (progress: ScanProgress) => {
      win.webContents.send('scan-progress', progress);
    };

    try {
      const results = await preAuthScanner.performQuickScan(onProgress);
      return results;
    } catch (error) {
      console.error('Scan error:', error);
      throw error;
    }
  });

  // Full scan handler (authenticated users)
  ipcMain.handle('full-scan', async (event, options: { userId: string; plan: string }) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) throw new Error('Window not found');

    const onProgress = (progress: ScanProgress) => {
      win.webContents.send('scan-progress', progress);
    };

    try {
      // Use authenticated scanner to return actual file paths
      const results = await authenticatedScanner.performFullScan(options, onProgress);
      return results;
    } catch (error) {
      console.error('Full scan error:', error);
      throw error;
    }
  });

  // Smart scan handlers for authenticated users
  ipcMain.handle('scan:start', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) throw new Error('Window not found');

    const onProgress = (progress: ScanProgress) => {
      win.webContents.send('scan:progress', progress);
    };

    try {
      // Start the scan in background
      preAuthScanner.performQuickScan(onProgress).then(results => {
        win.webContents.send('scan:complete', results);
      });
      
      return { started: true };
    } catch (error) {
      console.error('Scan start error:', error);
      throw error;
    }
  });

  ipcMain.handle('scan:complete', async (event) => {
    // This is handled by the scan:start promise resolution
    return new Promise((resolve) => {
      const handleComplete = (_: any, results: ScanSummary) => {
        ipcMain.removeListener('scan:complete', handleComplete);
        resolve(results);
      };
      ipcMain.on('scan:complete', handleComplete);
    });
  });

  // Cancel scan handler
  ipcMain.handle('cancel-scan', async () => {
    preAuthScanner.cancelScan();
    authenticatedScanner.cancelScan();
    return { success: true };
  });

  // Get system info
  ipcMain.handle('get-system-info', async () => {
    return preAuthScanner.getSystemInfo();
  });
}