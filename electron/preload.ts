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
  }
});