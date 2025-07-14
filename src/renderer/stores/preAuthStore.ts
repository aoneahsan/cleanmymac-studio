import { create } from 'zustand';
import type { ScanSummary, ScanProgress } from '@shared/types/scan';

interface PreAuthState {
  scanResults: ScanSummary | null;
  isScanning: boolean;
  scanProgress: number;
  scanPhase: string;
  error: string | null;
  
  startPreAuthScan: () => Promise<void>;
  setScanProgress: (progress: ScanProgress) => void;
  clearResults: () => void;
  setError: (error: string | null) => void;
}

export const usePreAuthStore = create<PreAuthState>((set, get) => ({
  scanResults: null,
  isScanning: false,
  scanProgress: 0,
  scanPhase: '',
  error: null,
  
  startPreAuthScan: async () => {
    set({ isScanning: true, scanProgress: 0, error: null });
    
    try {
      // Set up progress handler
      const progressHandler = (_event: any, progress: ScanProgress) => {
        get().setScanProgress(progress);
      };
      
      // Listen for progress updates
      if (window.electron) {
        // Progress will be handled via preload script
      }
      
      // Start the scan
      const results = await window.electron.scan.preAuthScan((progress) => {
        get().setScanProgress(progress);
      });
      
      set({ 
        scanResults: results, 
        isScanning: false,
        scanProgress: 100,
        scanPhase: 'Complete'
      });
    } catch (error) {
      console.error('Scan error:', error);
      set({ 
        isScanning: false, 
        error: error instanceof Error ? error.message : 'Scan failed'
      });
    }
  },
  
  setScanProgress: (progress: ScanProgress) => {
    set({ 
      scanProgress: progress.percentage, 
      scanPhase: progress.phase 
    });
  },
  
  clearResults: () => {
    set({ 
      scanResults: null, 
      scanProgress: 0, 
      scanPhase: '',
      error: null
    });
  },
  
  setError: (error: string | null) => {
    set({ error });
  },
}));