import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { ScanProgress, ScanSummary, ScanCategory, ScanItem } from '../../shared/types/scan';
import { SCAN_CATEGORIES } from '../../shared/constants/categories';
import { getLogger } from '../utils/logger';

const execAsync = promisify(exec);
const logger = getLogger('authenticated-scanner');

export class AuthenticatedScanner {
  private cancelled = false;
  private scanStartTime = 0;

  async performFullScan(
    options: { userId: string; plan: string },
    onProgress: (progress: ScanProgress) => void
  ): Promise<ScanSummary> {
    this.cancelled = false;
    this.scanStartTime = Date.now();
    
    logger.info('Starting authenticated scan', { userId: options.userId, plan: options.plan });
    
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
      
      const userCache = await this.scanUserCache(options.plan === 'pro');
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
      
      const logs = await this.scanLogs(options.plan === 'pro');
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
      
      logger.info('Scan completed', { 
        totalSpace, 
        itemCount, 
        scanTime: Date.now() - this.scanStartTime 
      });
      
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
      logger.error('Scan error:', error);
      throw error;
    }
  }

  cancelScan() {
    this.cancelled = true;
  }

  private async scanUserCache(isPro: boolean): Promise<ScanCategory> {
    const homeDir = os.homedir();
    const cachePath = path.join(homeDir, 'Library', 'Caches');
    
    try {
      const items = await this.scanDirectory(cachePath, 'cache', isPro ? 1000 : 100);
      const size = items.reduce((sum, item) => sum + item.size, 0);
      
      return {
        id: 'user_cache',
        type: 'cache',
        name: 'User Cache',
        description: 'Application caches and temporary files',
        size,
        itemCount: items.length,
        items,
      };
    } catch (error) {
      logger.error('Error scanning user cache:', error);
      return this.createEmptyCategory('user_cache');
    }
  }

  private async scanLogs(isPro: boolean): Promise<ScanCategory> {
    const homeDir = os.homedir();
    const logPaths = [
      path.join(homeDir, 'Library', 'Logs'),
      '/var/log',
    ];
    
    const allItems: ScanItem[] = [];

    for (const logPath of logPaths) {
      try {
        const items = await this.scanDirectory(logPath, 'logs', isPro ? 500 : 50);
        allItems.push(...items);
      } catch (error) {
        // Skip inaccessible directories
      }
    }

    const size = allItems.reduce((sum, item) => sum + item.size, 0);

    return {
      id: 'logs',
      type: 'logs',
      name: 'Log Files',
      description: 'Old system and application logs',
      size,
      itemCount: allItems.length,
      items: allItems,
    };
  }

  private async scanDownloads(): Promise<ScanCategory> {
    const homeDir = os.homedir();
    const downloadsPath = path.join(homeDir, 'Downloads');
    const items: ScanItem[] = [];
    
    try {
      const files = await fs.readdir(downloadsPath);

      for (const file of files) {
        if (file.endsWith('.dmg') || file.endsWith('.pkg')) {
          const filePath = path.join(downloadsPath, file);
          try {
            const stat = await fs.stat(filePath);
            items.push({
              path: filePath,
              size: stat.size,
              type: 'downloads',
              lastModified: stat.mtime,
              canDelete: true
            });
          } catch (error) {
            // Skip files we can't access
          }
        }
      }

      const size = items.reduce((sum, item) => sum + item.size, 0);

      return {
        id: 'downloads',
        type: 'downloads',
        name: 'Downloads Cleanup',
        description: 'Old downloads, DMG files, and installers',
        size,
        itemCount: items.length,
        items,
      };
    } catch (error) {
      return this.createEmptyCategory('downloads');
    }
  }

  private async scanTrash(): Promise<ScanCategory> {
    const homeDir = os.homedir();
    const trashPath = path.join(homeDir, '.Trash');
    
    try {
      const items = await this.scanDirectory(trashPath, 'trash', 1000);
      const size = items.reduce((sum, item) => sum + item.size, 0);
      
      return {
        id: 'trash',
        type: 'trash',
        name: 'Trash',
        description: 'Files in your Trash',
        size,
        itemCount: items.length,
        items,
      };
    } catch (error) {
      return this.createEmptyCategory('trash');
    }
  }

  private async scanDirectory(dirPath: string, type: string, maxItems: number): Promise<ScanItem[]> {
    const items: ScanItem[] = [];
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (items.length >= maxItems) break;
        
        const fullPath = path.join(dirPath, entry.name);
        
        try {
          if (entry.isDirectory()) {
            // For directories, calculate total size
            const size = await this.getDirectorySize(fullPath);
            if (size > 0) {
              items.push({
                path: fullPath,
                size,
                type,
                canDelete: this.isSafeToDelete(fullPath)
              });
            }
          } else if (entry.isFile()) {
            const stat = await fs.stat(fullPath);
            items.push({
              path: fullPath,
              size: stat.size,
              type,
              lastModified: stat.mtime,
              canDelete: this.isSafeToDelete(fullPath)
            });
          }
        } catch (error) {
          // Skip items we can't access
        }
      }
    } catch (error) {
      logger.warn('Failed to scan directory', { path: dirPath, error });
    }
    
    // Sort by size descending
    return items.sort((a, b) => b.size - a.size);
  }

  private isSafeToDelete(filePath: string): boolean {
    const protectedPaths = [
      '/System',
      '/Library',
      '/usr',
      '/bin',
      '/sbin',
      '/private/etc',
      '/private/var/db',
      '.DS_Store',
      'com.apple.',
      'MobileBackups'
    ];
    
    return !protectedPaths.some(protectedPath => filePath.includes(protectedPath));
  }

  private async getDirectorySize(dirPath: string): Promise<number> {
    try {
      const { stdout } = await execAsync(`du -sk "${dirPath}" 2>/dev/null || echo "0"`);
      const sizeKB = parseInt(stdout.split('\t')[0] || '0');
      return sizeKB * 1024; // Convert to bytes
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

  private createEmptyCategory(id: string): ScanCategory {
    const categoryDef = Object.values(SCAN_CATEGORIES).find(cat => cat.id === id);
    return {
      id,
      type: (categoryDef as any)?.type || 'junk',
      name: categoryDef?.name || id,
      description: categoryDef?.description || '',
      size: 0,
      itemCount: 0,
      items: [],
    };
  }
}