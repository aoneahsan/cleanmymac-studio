import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { ScanProgress, ScanSummary, ScanCategory } from '../../shared/types/scan';
import { SCAN_CATEGORIES } from '../../shared/constants/categories';

const execAsync = promisify(exec);

export class PreAuthScanner {
  private cancelled = false;
  private scanStartTime = 0;

  async performQuickScan(onProgress: (progress: ScanProgress) => void): Promise<ScanSummary> {
    this.cancelled = false;
    this.scanStartTime = Date.now();
    
    const results: Record<string, ScanCategory> = {};
    const phases = [
      { name: 'Analyzing system cache...', weight: 20 },
      { name: 'Checking user cache...', weight: 15 },
      { name: 'Scanning log files...', weight: 15 },
      { name: 'Checking downloads...', weight: 20 },
      { name: 'Analyzing trash...', weight: 10 },
      { name: 'Calculating space...', weight: 20 },
    ];

    let totalProgress = 0;
    
    try {
      // Phase 1: User Cache
      onProgress({
        percentage: 0,
        phase: phases[0].name,
        itemsScanned: 0,
      });
      
      const userCache = await this.scanUserCache();
      results.user_cache = userCache;
      totalProgress += phases[0].weight;
      
      onProgress({
        percentage: totalProgress,
        phase: phases[0].name,
        itemsScanned: userCache.itemCount,
      });

      if (this.cancelled) throw new Error('Scan cancelled');

      // Phase 2: System Logs
      onProgress({
        percentage: totalProgress,
        phase: phases[2].name,
        itemsScanned: userCache.itemCount,
      });
      
      const logs = await this.scanLogs();
      results.logs = logs;
      totalProgress += phases[2].weight;

      if (this.cancelled) throw new Error('Scan cancelled');

      // Phase 3: Downloads
      onProgress({
        percentage: totalProgress,
        phase: phases[3].name,
        itemsScanned: userCache.itemCount + logs.itemCount,
      });
      
      const downloads = await this.scanDownloads();
      results.downloads = downloads;
      totalProgress += phases[3].weight;

      if (this.cancelled) throw new Error('Scan cancelled');

      // Phase 4: Trash
      onProgress({
        percentage: totalProgress,
        phase: phases[4].name,
        itemsScanned: userCache.itemCount + logs.itemCount + downloads.itemCount,
      });
      
      const trash = await this.scanTrash();
      results.trash = trash;
      totalProgress += phases[4].weight;

      // Final calculations
      onProgress({
        percentage: 90,
        phase: 'Finalizing results...',
        itemsScanned: Object.values(results).reduce((sum, cat) => sum + cat.itemCount, 0),
      });

      const totalSpace = Object.values(results).reduce((sum, cat) => sum + cat.size, 0);
      const itemCount = Object.values(results).reduce((sum, cat) => sum + cat.itemCount, 0);

      onProgress({
        percentage: 100,
        phase: 'Scan complete!',
        itemsScanned: itemCount,
      });

      const categories = Object.values(results);
      
      return {
        totalSpace,
        breakdown: results,
        categories,
        itemCount,
        scanTime: Date.now() - this.scanStartTime,
        freeSpace: await this.getFreeSpace(),
        totalDiskSpace: await this.getTotalDiskSpace(),
      };
    } catch (error) {
      console.error('Scan error:', error);
      throw error;
    }
  }


  cancelScan() {
    this.cancelled = true;
  }

  private async scanUserCache(): Promise<ScanCategory> {
    const homeDir = os.homedir();
    const cachePath = path.join(homeDir, 'Library', 'Caches');
    
    try {
      const size = await this.getDirectorySize(cachePath);
      const itemCount = await this.countFiles(cachePath);
      
      return {
        id: 'user_cache',
        type: 'cache',
        name: 'User Cache',
        description: 'Application caches and temporary files',
        size,
        itemCount,
        items: [], // Don't expose actual file paths in pre-auth scan
      };
    } catch (error) {
      console.error('Error scanning user cache:', error);
      return this.createEmptyCategory('user_cache');
    }
  }

  private async scanLogs(): Promise<ScanCategory> {
    const homeDir = os.homedir();
    const logPaths = [
      path.join(homeDir, 'Library', 'Logs'),
      '/var/log',
    ];
    
    let totalSize = 0;
    let totalCount = 0;

    for (const logPath of logPaths) {
      try {
        const size = await this.getDirectorySize(logPath);
        const count = await this.countFiles(logPath);
        totalSize += size;
        totalCount += count;
      } catch (error) {
        // Skip inaccessible directories
      }
    }

    return {
      id: 'logs',
      type: 'logs',
      name: 'Log Files',
      description: 'Old system and application logs',
      size: totalSize,
      itemCount: totalCount,
      items: [],
    };
  }

  private async scanDownloads(): Promise<ScanCategory> {
    const homeDir = os.homedir();
    const downloadsPath = path.join(homeDir, 'Downloads');
    
    try {
      // Look for DMG files and old downloads
      const files = await fs.readdir(downloadsPath);
      let totalSize = 0;
      let dmgCount = 0;

      for (const file of files) {
        if (file.endsWith('.dmg') || file.endsWith('.pkg')) {
          const filePath = path.join(downloadsPath, file);
          try {
            const stat = await fs.stat(filePath);
            totalSize += stat.size;
            dmgCount++;
          } catch (error) {
            // Skip files we can't access
          }
        }
      }

      return {
        id: 'downloads',
        type: 'downloads',
        name: 'Downloads Cleanup',
        description: 'Old downloads, DMG files, and installers',
        size: totalSize,
        itemCount: dmgCount,
        items: [],
      };
    } catch (error) {
      return this.createEmptyCategory('downloads');
    }
  }

  private async scanTrash(): Promise<ScanCategory> {
    const homeDir = os.homedir();
    const trashPath = path.join(homeDir, '.Trash');
    
    try {
      const size = await this.getDirectorySize(trashPath);
      const itemCount = await this.countFiles(trashPath);
      
      return {
        id: 'trash',
        type: 'trash',
        name: 'Trash',
        description: 'Files in your Trash',
        size,
        itemCount,
        items: [],
      };
    } catch (error) {
      return this.createEmptyCategory('trash');
    }
  }

  private async getDirectorySize(dirPath: string): Promise<number> {
    try {
      // Use du command for faster directory size calculation
      const { stdout } = await execAsync(`du -sk "${dirPath}" 2>/dev/null || echo "0"`);
      const sizeKB = parseInt(stdout.split('\t')[0] || '0');
      return sizeKB * 1024; // Convert to bytes
    } catch (error) {
      return 0;
    }
  }

  private async countFiles(dirPath: string): Promise<number> {
    try {
      const { stdout } = await execAsync(`find "${dirPath}" -type f 2>/dev/null | wc -l`);
      return parseInt(stdout.trim() || '0');
    } catch (error) {
      return 0;
    }
  }

  private async getFreeSpace(): Promise<number> {
    try {
      const { stdout } = await execAsync('df -k / | tail -1');
      const parts = stdout.trim().split(/\s+/);
      return parseInt(parts[3]) * 1024; // Convert KB to bytes
    } catch (error) {
      return 0;
    }
  }

  private async getTotalDiskSpace(): Promise<number> {
    try {
      const { stdout } = await execAsync('df -k / | tail -1');
      const parts = stdout.trim().split(/\s+/);
      return parseInt(parts[1]) * 1024; // Convert KB to bytes
    } catch (error) {
      return 0;
    }
  }

  async getSystemInfo() {
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const platform = os.platform();
    const release = os.release();
    
    return {
      platform,
      release,
      arch: os.arch(),
      cpuModel: cpus[0]?.model || 'Unknown',
      cpuCores: cpus.length,
      totalMemory,
      freeMemory,
      memoryUsage: ((totalMemory - freeMemory) / totalMemory) * 100,
      homeDirectory: os.homedir(),
      tmpDirectory: os.tmpdir(),
    };
  }

  private createEmptyCategory(id: string): ScanCategory {
    const categoryDef = Object.values(SCAN_CATEGORIES).find(cat => cat.id === id);
    return {
      id,
      name: categoryDef?.name || id,
      description: categoryDef?.description || '',
      size: 0,
      itemCount: 0,
      items: [],
    };
  }

  async performFullScan(
    options: { userId: string; plan: string },
    onProgress: (progress: ScanProgress) => void
  ): Promise<ScanSummary> {
    // For now, just use the quick scan
    // TODO: Implement more comprehensive scanning based on plan
    return this.performQuickScan(onProgress);
  }
}