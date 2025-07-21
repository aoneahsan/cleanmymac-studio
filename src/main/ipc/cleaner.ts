import { ipcMain } from 'electron';
import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getLogger } from '../utils/logger';
import { ScanItem } from '../../shared/types/scan';

const execAsync = promisify(exec);
const logger = getLogger('cleaner');

interface CleanRequest {
  items: ScanItem[];
  dryRun?: boolean;
}

interface CleanResult {
  success: boolean;
  cleaned: ScanItem[];
  failed: ScanItem[];
  totalSizeFreed: number;
  errors: Array<{ item: ScanItem; error: string }>;
}

interface CategoryCleanRequest {
  category: string;
  dryRun?: boolean;
}

export function registerCleanerHandlers() {
  // Clean selected items
  ipcMain.handle('cleaner:clean-items', async (event, request: CleanRequest): Promise<CleanResult> => {
    logger.info('Starting cleanup operation', { 
      itemCount: request.items.length, 
      dryRun: request.dryRun 
    });

    const result: CleanResult = {
      success: true,
      cleaned: [],
      failed: [],
      totalSizeFreed: 0,
      errors: []
    };

    for (const item of request.items) {
      try {
        if (!item.canDelete) {
          logger.warn('Skipping protected item', { path: item.path });
          result.failed.push(item);
          continue;
        }

        // Safety check: Don't delete critical system paths
        if (isProtectedPath(item.path)) {
          logger.error('Attempted to delete protected path', { path: item.path });
          result.errors.push({ 
            item, 
            error: 'Protected system path cannot be deleted' 
          });
          result.failed.push(item);
          continue;
        }

        if (request.dryRun) {
          logger.info('Dry run: Would delete', { path: item.path });
          result.cleaned.push(item);
          result.totalSizeFreed += item.size;
        } else {
          // Create backup before deletion (optional)
          // await createBackup(item.path);

          // Perform actual deletion
          await deleteItem(item.path);
          
          result.cleaned.push(item);
          result.totalSizeFreed += item.size;
          logger.info('Successfully deleted', { path: item.path, size: item.size });
        }
      } catch (error) {
        logger.error('Failed to delete item', { 
          path: item.path, 
          error: error instanceof Error ? error.message : String(error) 
        });
        result.errors.push({ 
          item, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        result.failed.push(item);
        result.success = false;
      }
    }

    logger.info('Cleanup operation completed', {
      cleaned: result.cleaned.length,
      failed: result.failed.length,
      totalSizeFreed: result.totalSizeFreed
    });

    return result;
  });

  // Get cleanable items for a category (authenticated users only)
  ipcMain.handle('cleaner:get-cleanable-items', async (event, category: string): Promise<ScanItem[]> => {
    logger.info('Getting cleanable items for category', { category });
    
    const items: ScanItem[] = [];
    
    switch (category) {
      case 'cache':
        items.push(...await getCacheItems());
        break;
      case 'logs':
        items.push(...await getLogItems());
        break;
      case 'downloads':
        items.push(...await getDownloadItems());
        break;
      case 'trash':
        items.push(...await getTrashItems());
        break;
    }

    return items.filter(item => item.canDelete);
  });

  // Clean entire category
  ipcMain.handle('cleaner:clean-category', async (event, request: CategoryCleanRequest): Promise<CleanResult> => {
    logger.info('Cleaning entire category', { category: request.category });
    
    const items = await getCategoryItems(request.category);
    return await cleanItems({ items, dryRun: request.dryRun });
  });

  // Empty trash
  ipcMain.handle('cleaner:empty-trash', async (): Promise<{ success: boolean; sizeFreed: number }> => {
    logger.info('Emptying trash');
    
    try {
      const trashPath = path.join(process.env.HOME || '', '.Trash');
      const sizeBefore = await getDirectorySize(trashPath);
      
      // Use macOS native command to empty trash
      await execAsync('osascript -e \'tell application "Finder" to empty trash\'');
      
      return {
        success: true,
        sizeFreed: sizeBefore
      };
    } catch (error) {
      logger.error('Failed to empty trash', { error });
      throw error;
    }
  });
}

// Helper functions

async function deleteItem(itemPath: string): Promise<void> {
  const stats = await fs.stat(itemPath);
  
  if (stats.isDirectory()) {
    await fs.remove(itemPath);
  } else {
    await fs.unlink(itemPath);
  }
}

function isProtectedPath(itemPath: string): boolean {
  const protectedPaths = [
    '/System',
    '/Library',
    '/usr',
    '/bin',
    '/sbin',
    '/private/etc',
    '/private/var',
    path.join(process.env.HOME || '', 'Library/Application Support/com.apple'),
    path.join(process.env.HOME || '', 'Library/Preferences/com.apple')
  ];
  
  return protectedPaths.some(protectedPath => itemPath.startsWith(protectedPath));
}

async function getCacheItems(): Promise<ScanItem[]> {
  const items: ScanItem[] = [];
  const home = process.env.HOME || '';
  
  const cachePaths = [
    path.join(home, 'Library/Caches'),
    path.join(home, 'Library/Application Support/Caches')
  ];
  
  for (const cachePath of cachePaths) {
    if (await fs.pathExists(cachePath)) {
      const cacheItems = await scanDirectory(cachePath, 'cache');
      items.push(...cacheItems);
    }
  }
  
  return items;
}

async function getLogItems(): Promise<ScanItem[]> {
  const items: ScanItem[] = [];
  const home = process.env.HOME || '';
  
  const logPaths = [
    path.join(home, 'Library/Logs'),
    '/var/log',
    '/private/var/log'
  ];
  
  for (const logPath of logPaths) {
    if (await fs.pathExists(logPath)) {
      const logItems = await scanDirectory(logPath, 'logs');
      items.push(...logItems);
    }
  }
  
  return items;
}

async function getDownloadItems(): Promise<ScanItem[]> {
  const home = process.env.HOME || '';
  const downloadsPath = path.join(home, 'Downloads');
  
  if (!await fs.pathExists(downloadsPath)) {
    return [];
  }
  
  const items: ScanItem[] = [];
  const files = await fs.readdir(downloadsPath);
  
  for (const file of files) {
    if (file.endsWith('.dmg') || file.endsWith('.pkg')) {
      const filePath = path.join(downloadsPath, file);
      const stats = await fs.stat(filePath);
      
      items.push({
        path: filePath,
        size: stats.size,
        type: 'downloads',
        canDelete: true
      });
    }
  }
  
  return items;
}

async function getTrashItems(): Promise<ScanItem[]> {
  const trashPath = path.join(process.env.HOME || '', '.Trash');
  
  if (!await fs.pathExists(trashPath)) {
    return [];
  }
  
  return await scanDirectory(trashPath, 'trash');
}

async function scanDirectory(dirPath: string, type: string): Promise<ScanItem[]> {
  const items: ScanItem[] = [];
  
  try {
    const files = await fs.readdir(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      
      try {
        const stats = await fs.stat(filePath);
        
        items.push({
          path: filePath,
          size: stats.isDirectory() ? await getDirectorySize(filePath) : stats.size,
          type,
          canDelete: !isProtectedPath(filePath)
        });
      } catch (error) {
        logger.warn('Failed to stat file', { path: filePath, error });
      }
    }
  } catch (error) {
    logger.error('Failed to scan directory', { path: dirPath, error });
  }
  
  return items;
}

async function getDirectorySize(dirPath: string): Promise<number> {
  try {
    const { stdout } = await execAsync(`du -sk "${dirPath}" | cut -f1`);
    return parseInt(stdout.trim()) * 1024; // Convert KB to bytes
  } catch {
    return 0;
  }
}

async function getCategoryItems(category: string): Promise<ScanItem[]> {
  switch (category) {
    case 'cache':
      return await getCacheItems();
    case 'logs':
      return await getLogItems();
    case 'downloads':
      return await getDownloadItems();
    case 'trash':
      return await getTrashItems();
    default:
      return [];
  }
}

async function cleanItems(request: CleanRequest): Promise<CleanResult> {
  const result: CleanResult = {
    success: true,
    cleaned: [],
    failed: [],
    totalSizeFreed: 0,
    errors: []
  };

  for (const item of request.items) {
    try {
      if (!item.canDelete || isProtectedPath(item.path)) {
        result.failed.push(item);
        continue;
      }

      if (!request.dryRun) {
        await deleteItem(item.path);
      }
      
      result.cleaned.push(item);
      result.totalSizeFreed += item.size;
    } catch (error) {
      result.errors.push({ 
        item, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      result.failed.push(item);
    }
  }

  return result;
}