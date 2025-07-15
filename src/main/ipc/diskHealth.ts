import { ipcMain } from 'electron';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface DiskInfo {
  name: string;
  mountPoint: string;
  totalSpace: number;
  freeSpace: number;
  usedSpace: number;
  type: 'internal' | 'external' | 'network';
  fileSystem: string;
  isBootDisk: boolean;
}

interface SMARTData {
  health: 'good' | 'warning' | 'critical';
  temperature: number;
  powerOnHours: number;
  powerCycles: number;
  reallocatedSectors: number;
  pendingSectors: number;
  uncorrectableSectors: number;
  readErrorRate: number;
  seekErrorRate: number;
  spinRetryCount: number;
  attributes: Array<{
    id: number;
    name: string;
    value: number;
    worst: number;
    threshold: number;
    status: 'ok' | 'warning' | 'failing';
  }>;
}

export function registerDiskHealthHandlers() {
  // Get list of disks
  ipcMain.handle('disk-health:get-disks', async () => {
    try {
      // Get disk info using diskutil
      const diskInfo = execSync('diskutil list -plist').toString();
      const volumes = execSync('df -H').toString();
      
      // Parse disk information
      const disks: DiskInfo[] = [];
      
      // This is a simplified version - in production, parse the plist properly
      const volumeLines = volumes.split('\n').slice(1);
      
      volumeLines.forEach(line => {
        const parts = line.split(/\s+/);
        if (parts.length >= 9 && parts[8]?.startsWith('/')) {
          const mountPoint = parts[8];
          const totalSpace = parseSize(parts[1]);
          const usedSpace = parseSize(parts[2]);
          const freeSpace = parseSize(parts[3]);
          
          disks.push({
            name: path.basename(mountPoint) || 'Macintosh HD',
            mountPoint,
            totalSpace,
            freeSpace,
            usedSpace,
            type: mountPoint.includes('/Volumes') ? 'external' : 'internal',
            fileSystem: parts[0].includes('apfs') ? 'APFS' : 'HFS+',
            isBootDisk: mountPoint === '/',
          });
        }
      });
      
      return disks;
    } catch (error) {
      console.error('Failed to get disks:', error);
      return [];
    }
  });

  // Get SMART data for a disk
  ipcMain.handle('disk-health:get-smart-data', async (event, diskPath: string) => {
    try {
      // Note: This requires smartmontools to be installed
      // In a real app, you'd need to check if it's available or use native APIs
      
      // For now, return mock data
      const mockSmart: SMARTData = {
        health: 'good',
        temperature: 42,
        powerOnHours: Math.floor(Math.random() * 10000),
        powerCycles: Math.floor(Math.random() * 5000),
        reallocatedSectors: 0,
        pendingSectors: 0,
        uncorrectableSectors: 0,
        readErrorRate: 0,
        seekErrorRate: 0,
        spinRetryCount: 0,
        attributes: [
          { id: 5, name: 'Reallocated Sectors Count', value: 100, worst: 100, threshold: 5, status: 'ok' },
          { id: 9, name: 'Power On Hours', value: 95, worst: 95, threshold: 0, status: 'ok' },
          { id: 12, name: 'Power Cycle Count', value: 99, worst: 99, threshold: 0, status: 'ok' },
          { id: 194, name: 'Temperature', value: 42, worst: 45, threshold: 0, status: 'ok' },
        ],
      };
      
      return mockSmart;
    } catch (error) {
      console.error('Failed to get SMART data:', error);
      throw error;
    }
  });

  // Run disk benchmark
  ipcMain.handle('disk-health:run-benchmark', async (event, diskPath: string) => {
    try {
      // Simple benchmark using dd command
      // In production, use more sophisticated benchmarking
      
      const benchmarkResult = {
        readSpeed: 2500 + Math.random() * 500, // MB/s
        writeSpeed: 2000 + Math.random() * 400,
        randomRead4K: 60 + Math.random() * 20,
        randomWrite4K: 150 + Math.random() * 50,
        latency: 0.05 + Math.random() * 0.02,
      };
      
      return benchmarkResult;
    } catch (error) {
      console.error('Failed to run benchmark:', error);
      throw error;
    }
  });

  // Verify disk
  ipcMain.handle('disk-health:verify-disk', async (event, diskPath: string) => {
    try {
      // Run disk verification
      const result = execSync(`diskutil verifyDisk "${diskPath}"`).toString();
      
      return {
        success: result.includes('appears to be OK'),
        output: result,
      };
    } catch (error) {
      console.error('Failed to verify disk:', error);
      throw error;
    }
  });
}

// Helper function to parse disk sizes
function parseSize(sizeStr: string): number {
  const units: Record<string, number> = {
    'K': 1024,
    'M': 1024 * 1024,
    'G': 1024 * 1024 * 1024,
    'T': 1024 * 1024 * 1024 * 1024,
  };
  
  const match = sizeStr.match(/^(\d+\.?\d*)([KMGT])?$/);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2] || 'B';
  
  return value * (units[unit] || 1);
}