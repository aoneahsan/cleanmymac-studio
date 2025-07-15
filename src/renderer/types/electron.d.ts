export interface ElectronAPI {
  quit: () => void;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export {};