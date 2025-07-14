export interface IElectronAPI {
  scan: {
    preAuthScan: (onProgress: (progress: any) => void) => Promise<any>;
  };
  auth: {
    login: (email: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<any>;
  };
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}