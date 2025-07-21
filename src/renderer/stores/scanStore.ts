import { create } from 'zustand';
import type { ScanProgress, ScanSummary } from '@shared/types/scan';
import { useAuthStore } from './authStore';

interface ScanState {
  isScanning: boolean;
  scanProgress: ScanProgress | null;
  scanResults: ScanSummary | null;
  error: string | null;
  
  startScan: (onProgress?: (progress: ScanProgress) => void) => Promise<void>;
  startAuthenticatedScan: (onProgress?: (progress: ScanProgress) => void) => Promise<void>;
  resetScan: () => void;
  setScanResults: (results: ScanSummary) => void;
}

export const useScanStore = create<ScanState>((set, get) => ({
  isScanning: false,
  scanProgress: null,
  scanResults: null,
  error: null,
  
  startScan: async (onProgress) => {
    set({ isScanning: true, error: null, scanProgress: null });
    
    try {
      // Use IPC to start scan
      await window.electron.ipcRenderer.invoke('scan:start');
      
      // Listen for progress updates
      const removeListener = window.electron.ipcRenderer.on('scan:progress', (progress: ScanProgress) => {
        set({ scanProgress: progress });
        onProgress?.(progress);
      });
      
      // Wait for completion
      const results = await window.electron.ipcRenderer.invoke('scan:complete');
      
      // Clean up listener
      removeListener();
      
      set({ 
        isScanning: false, 
        scanResults: results,
        scanProgress: null 
      });
      
    } catch (error) {
      set({ 
        isScanning: false, 
        error: error instanceof Error ? error.message : 'Scan failed',
        scanProgress: null 
      });
    }
  },
  
  startAuthenticatedScan: async (onProgress) => {
    set({ isScanning: true, error: null, scanProgress: null });
    
    const authState = useAuthStore.getState();
    const user = authState.user;
    
    if (!user) {
      set({ 
        isScanning: false, 
        error: 'User not authenticated',
        scanProgress: null 
      });
      return;
    }
    
    try {
      // Listen for progress updates
      const removeListener = window.electron.ipcRenderer.on('scan-progress', (progress: ScanProgress) => {
        set({ scanProgress: progress });
        onProgress?.(progress);
      });
      
      // Start authenticated scan with user info
      const results = await window.electron.ipcRenderer.invoke('full-scan', {
        userId: user.uid,
        plan: user.plan.type
      });
      
      // Clean up listener
      removeListener();
      
      set({ 
        isScanning: false, 
        scanResults: results,
        scanProgress: null 
      });
      
    } catch (error) {
      set({ 
        isScanning: false, 
        error: error instanceof Error ? error.message : 'Scan failed',
        scanProgress: null 
      });
    }
  },
  
  resetScan: () => {
    set({
      isScanning: false,
      scanProgress: null,
      scanResults: null,
      error: null,
    });
  },
  
  setScanResults: (results) => {
    set({ scanResults: results });
  },
}));