import { ipcMain } from 'electron';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);

interface AppInfo {
  id: string;
  name: string;
  version: string;
  size: number;
  installDate: Date;
  lastUsed: Date;
  path: string;
  bundleId?: string;
  category: string;
  isSystemApp: boolean;
  associatedFiles: {
    preferences: string[];
    caches: string[];
    logs: string[];
    applicationSupport: string[];
    savedState: string[];
    launchAgents: string[];
    other: string[];
  };
  totalSize: number;
}

export function registerAppUninstallerHandlers() {
  // Get list of installed applications
  ipcMain.handle('app-uninstaller:get-apps', async () => {
    try {
      const apps: AppInfo[] = [];
      const appDirs = ['/Applications', path.join(process.env.HOME!, 'Applications')];
      
      for (const dir of appDirs) {
        if (!fs.existsSync(dir)) continue;
        
        const files = await readdir(dir);
        for (const file of files) {
          if (!file.endsWith('.app')) continue;
          
          const appPath = path.join(dir, file);
          const appStat = await stat(appPath);
          
          // Get app info from Info.plist
          const infoPlistPath = path.join(appPath, 'Contents', 'Info.plist');
          let appInfo: any = {};
          
          if (fs.existsSync(infoPlistPath)) {
            try {
              const plistContent = execSync(`defaults read "${infoPlistPath}"`).toString();
              // Parse plist content (simplified)
              const bundleId = plistContent.match(/CFBundleIdentifier\s*=\s*"([^"]+)"/)?.[1];
              const version = plistContent.match(/CFBundleShortVersionString\s*=\s*"([^"]+)"/)?.[1];
              
              appInfo = { bundleId, version };
            } catch (e) {
              // Ignore errors
            }
          }
          
          // Find associated files
          const associatedFiles = await findAssociatedFiles(appInfo.bundleId || file.replace('.app', ''));
          
          // Calculate total size
          const appSize = await getDirectorySize(appPath);
          const totalSize = appSize + await calculateAssociatedFilesSize(associatedFiles);
          
          apps.push({
            id: appPath,
            name: file.replace('.app', ''),
            version: appInfo.version || '1.0.0',
            size: appSize,
            installDate: appStat.birthtime,
            lastUsed: appStat.atime,
            path: appPath,
            bundleId: appInfo.bundleId,
            category: getAppCategory(file),
            isSystemApp: dir === '/Applications' && isSystemApp(file),
            associatedFiles,
            totalSize,
          });
        }
      }
      
      return apps;
    } catch (error) {
      console.error('Failed to get apps:', error);
      return [];
    }
  });

  // Uninstall application
  ipcMain.handle('app-uninstaller:uninstall', async (event, appId: string, options: any) => {
    try {
      const appPath = appId; // In our case, appId is the path
      
      // Create backup if requested
      if (options.createBackup) {
        const backupPath = path.join(process.env.HOME!, 'Desktop', `${path.basename(appPath)}_backup_${Date.now()}.zip`);
        execSync(`zip -r "${backupPath}" "${appPath}"`);
      }
      
      // Remove app bundle
      await removeDirectory(appPath);
      
      // Remove associated files based on options
      const appName = path.basename(appPath).replace('.app', '');
      const associatedFiles = await findAssociatedFiles(appName);
      
      if (options.removePreferences) {
        for (const file of associatedFiles.preferences) {
          await removeFile(file);
        }
      }
      
      if (options.removeCaches) {
        for (const file of associatedFiles.caches) {
          await removeFile(file);
        }
      }
      
      if (options.removeLogs) {
        for (const file of associatedFiles.logs) {
          await removeFile(file);
        }
      }
      
      if (options.removeApplicationSupport) {
        for (const file of associatedFiles.applicationSupport) {
          await removeFile(file);
        }
      }
      
      if (options.removeSavedState) {
        for (const file of associatedFiles.savedState) {
          await removeFile(file);
        }
      }
      
      if (options.removeLaunchAgents) {
        for (const file of associatedFiles.launchAgents) {
          await removeFile(file);
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to uninstall app:', error);
      throw error;
    }
  });

  // Scan for leftover files
  ipcMain.handle('app-uninstaller:scan-leftovers', async () => {
    try {
      // Look for orphaned files in common locations
      const locations = [
        path.join(process.env.HOME!, 'Library/Preferences'),
        path.join(process.env.HOME!, 'Library/Caches'),
        path.join(process.env.HOME!, 'Library/Application Support'),
      ];
      
      const leftovers: string[] = [];
      
      // This is a simplified version
      // In production, you'd cross-reference with installed apps
      
      return leftovers;
    } catch (error) {
      console.error('Failed to scan leftovers:', error);
      return [];
    }
  });
}

// Helper functions
async function findAssociatedFiles(appIdentifier: string) {
  const home = process.env.HOME!;
  const files = {
    preferences: [] as string[],
    caches: [] as string[],
    logs: [] as string[],
    applicationSupport: [] as string[],
    savedState: [] as string[],
    launchAgents: [] as string[],
    other: [] as string[],
  };
  
  // Common patterns for app files
  const patterns = [
    appIdentifier,
    appIdentifier.toLowerCase(),
    appIdentifier.replace(/\s+/g, ''),
    `com.${appIdentifier.toLowerCase()}`,
  ];
  
  // Search in common locations
  const searchLocations = [
    { path: path.join(home, 'Library/Preferences'), type: 'preferences' },
    { path: path.join(home, 'Library/Caches'), type: 'caches' },
    { path: path.join(home, 'Library/Logs'), type: 'logs' },
    { path: path.join(home, 'Library/Application Support'), type: 'applicationSupport' },
    { path: path.join(home, 'Library/Saved Application State'), type: 'savedState' },
    { path: path.join(home, 'Library/LaunchAgents'), type: 'launchAgents' },
  ];
  
  for (const location of searchLocations) {
    if (!fs.existsSync(location.path)) continue;
    
    try {
      const items = await readdir(location.path);
      for (const item of items) {
        for (const pattern of patterns) {
          if (item.toLowerCase().includes(pattern.toLowerCase())) {
            files[location.type as keyof typeof files].push(path.join(location.path, item));
            break;
          }
        }
      }
    } catch (e) {
      // Ignore errors
    }
  }
  
  return files;
}

async function getDirectorySize(dirPath: string): Promise<number> {
  try {
    const output = execSync(`du -sk "${dirPath}"`).toString();
    const size = parseInt(output.split('\t')[0]) * 1024; // Convert from KB to bytes
    return size;
  } catch {
    return 0;
  }
}

async function calculateAssociatedFilesSize(files: any): Promise<number> {
  let totalSize = 0;
  
  for (const category of Object.values(files)) {
    for (const file of category as string[]) {
      try {
        const stats = await stat(file);
        if (stats.isDirectory()) {
          totalSize += await getDirectorySize(file);
        } else {
          totalSize += stats.size;
        }
      } catch {
        // Ignore errors
      }
    }
  }
  
  return totalSize;
}

function getAppCategory(appName: string): string {
  const categories: Record<string, string[]> = {
    'Developer Tools': ['Xcode', 'Visual Studio', 'Terminal', 'iTerm'],
    'Productivity': ['Slack', 'Notion', 'Obsidian', 'Microsoft'],
    'Graphics & Design': ['Adobe', 'Sketch', 'Figma', 'Affinity'],
    'Games': ['Steam', 'Epic Games', 'Battle.net'],
    'Utilities': ['CleanMyMac', 'Alfred', 'Bartender'],
    'Media': ['VLC', 'IINA', 'Spotify', 'Music'],
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => appName.includes(keyword))) {
      return category;
    }
  }
  
  return 'Other';
}

function isSystemApp(appName: string): boolean {
  const systemApps = [
    'App Store', 'Automator', 'Books', 'Calculator', 'Calendar', 'Chess',
    'Contacts', 'Dictionary', 'FaceTime', 'Finder', 'Font Book', 'Home',
    'Image Capture', 'Launchpad', 'Mail', 'Maps', 'Messages', 'Mission Control',
    'Music', 'News', 'Notes', 'Photo Booth', 'Photos', 'Podcasts', 'Preview',
    'QuickTime Player', 'Reminders', 'Safari', 'Shortcuts', 'Siri', 'Stickies',
    'Stocks', 'System Preferences', 'TextEdit', 'Time Machine', 'TV', 'Voice Memos',
  ];
  
  return systemApps.includes(appName.replace('.app', ''));
}

async function removeFile(filePath: string) {
  try {
    const stats = await stat(filePath);
    if (stats.isDirectory()) {
      await removeDirectory(filePath);
    } else {
      await unlink(filePath);
    }
  } catch (e) {
    // Ignore errors
  }
}

async function removeDirectory(dirPath: string) {
  try {
    execSync(`rm -rf "${dirPath}"`);
  } catch (e) {
    // Ignore errors
  }
}