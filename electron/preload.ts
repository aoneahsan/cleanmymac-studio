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
  }
});