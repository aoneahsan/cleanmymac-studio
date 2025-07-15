export interface IElectronAPI {
  scan: {
    preAuthScan: (onProgress: (progress: any) => void) => Promise<any>;
  };
  auth: {
    login: (email: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<any>;
  };
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => Promise<any>;
    on: (channel: string, listener: (data: any) => void) => () => void;
  };
  quit?: () => void;
  showNotification?: (title: string, body: string, options?: any) => void;
  setNotificationPreference?: (enabled: boolean) => void;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}