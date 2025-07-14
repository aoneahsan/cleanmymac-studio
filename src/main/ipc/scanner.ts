import { ipcMain, BrowserWindow } from 'electron';
import { PreAuthScanner } from '../modules/pre-auth-scanner';
import type { ScanProgress, ScanSummary } from '../../shared/types/scan';

export function registerScannerHandlers() {
  const scanner = new PreAuthScanner();

  // Pre-auth scan handler
  ipcMain.handle('pre-auth-scan', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) throw new Error('Window not found');

    // Progress callback
    const onProgress = (progress: ScanProgress) => {
      win.webContents.send('scan-progress', progress);
    };

    try {
      const results = await scanner.performQuickScan(onProgress);
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
      // TODO: Implement full scan based on user plan
      const results = await scanner.performFullScan(options, onProgress);
      return results;
    } catch (error) {
      console.error('Full scan error:', error);
      throw error;
    }
  });

  // Cancel scan handler
  ipcMain.handle('cancel-scan', async () => {
    scanner.cancelScan();
    return { success: true };
  });

  // Get system info
  ipcMain.handle('get-system-info', async () => {
    return scanner.getSystemInfo();
  });
}