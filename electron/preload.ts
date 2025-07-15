import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  scan: {
    preAuthScan: (onProgress: (progress: any) => void) => {
      // Listen for progress updates
      const progressHandler = (_event: any, progress: any) => {
        onProgress(progress);
      };
      ipcRenderer.on('scan-progress', progressHandler);
      
      // Start scan and return promise
      return ipcRenderer.invoke('pre-auth-scan').finally(() => {
        ipcRenderer.removeListener('scan-progress', progressHandler);
      });
    }
  },
  auth: {
    login: (email: string, password: string) => ipcRenderer.invoke('auth:login', email, password),
    logout: () => ipcRenderer.invoke('auth:logout'),
    getCurrentUser: () => ipcRenderer.invoke('auth:current-user')
  },
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
    on: (channel: string, listener: (data: any) => void) => {
      const wrappedListener = (_event: any, ...args: any[]) => listener(args[0]);
      ipcRenderer.on(channel, wrappedListener);
      // Return a function to remove the listener
      return () => ipcRenderer.removeListener(channel, wrappedListener);
    }
  },
  bookmarks: {
    requestFolder: (title?: string) => ipcRenderer.invoke('bookmarks:request-folder', title),
    requestFile: (title?: string) => ipcRenderer.invoke('bookmarks:request-file', title),
    getAll: () => ipcRenderer.invoke('bookmarks:get-all'),
    remove: (filePath: string) => ipcRenderer.invoke('bookmarks:remove', filePath),
    hasAccess: (filePath: string) => ipcRenderer.invoke('bookmarks:has-access', filePath),
  },
  updater: {
    check: () => ipcRenderer.invoke('updater:check'),
    download: () => ipcRenderer.invoke('updater:download'),
    install: () => ipcRenderer.invoke('updater:install'),
    getChannel: () => ipcRenderer.invoke('updater:get-channel'),
    setChannel: (channel: 'latest' | 'beta') => ipcRenderer.invoke('updater:set-channel', channel),
    getVersion: () => ipcRenderer.invoke('updater:get-version'),
    onUpdateAvailable: (callback: (info: any) => void) => {
      ipcRenderer.on('update-available', (_event, info) => callback(info));
    },
    onDownloadProgress: (callback: (progress: any) => void) => {
      ipcRenderer.on('update-download-progress', (_event, progress) => callback(progress));
    },
    onUpdateDownloaded: (callback: (info: any) => void) => {
      ipcRenderer.on('update-downloaded', (_event, info) => callback(info));
    },
    onError: (callback: (error: string) => void) => {
      ipcRenderer.on('update-error', (_event, error) => callback(error));
    }
  }
});