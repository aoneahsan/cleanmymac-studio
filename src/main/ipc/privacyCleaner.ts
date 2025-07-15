import { ipcMain } from 'electron';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);

interface PrivacyItem {
  id: string;
  category: string;
  name: string;
  description: string;
  path: string;
  size?: number;
  count?: number;
  risk: 'low' | 'medium' | 'high';
}

interface BrowserData {
  browser: string;
  profilePath: string;
  history: { count: number; size: number; path: string };
  cookies: { count: number; size: number; path: string };
  cache: { size: number; path: string };
  downloads: { count: number; path: string };
  autofill: { count: number; path: string };
}

export function registerPrivacyCleanerHandlers() {
  // Scan for privacy data
  ipcMain.handle('privacy-cleaner:scan', async () => {
    try {
      const items: PrivacyItem[] = [];
      
      // Scan browsers
      const browserData = await scanBrowsers();
      for (const browser of browserData) {
        if (browser.history.count > 0) {
          items.push({
            id: `${browser.browser}-history`,
            category: 'browser',
            name: `${browser.browser} History`,
            description: `Browsing history from ${browser.browser}`,
            path: browser.history.path,
            count: browser.history.count,
            size: browser.history.size,
            risk: 'medium',
          });
        }
        
        if (browser.cookies.count > 0) {
          items.push({
            id: `${browser.browser}-cookies`,
            category: 'browser',
            name: `${browser.browser} Cookies`,
            description: `Cookies stored by ${browser.browser}`,
            path: browser.cookies.path,
            count: browser.cookies.count,
            size: browser.cookies.size,
            risk: 'high',
          });
        }
        
        if (browser.cache.size > 0) {
          items.push({
            id: `${browser.browser}-cache`,
            category: 'browser',
            name: `${browser.browser} Cache`,
            description: `Cached files from ${browser.browser}`,
            path: browser.cache.path,
            size: browser.cache.size,
            risk: 'low',
          });
        }
      }
      
      // Scan system privacy items
      const systemItems = await scanSystemPrivacy();
      items.push(...systemItems);
      
      // Scan application privacy data
      const appItems = await scanApplicationPrivacy();
      items.push(...appItems);
      
      return items;
    } catch (error) {
      console.error('Failed to scan privacy data:', error);
      return [];
    }
  });

  // Clean selected privacy items
  ipcMain.handle('privacy-cleaner:clean', async (event, itemIds: string[]) => {
    try {
      const results = [];
      
      for (const itemId of itemIds) {
        try {
          await cleanPrivacyItem(itemId);
          results.push({ id: itemId, success: true });
        } catch (error) {
          results.push({ id: itemId, success: false, error: error instanceof Error ? error.message : String(error) });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Failed to clean privacy data:', error);
      throw error;
    }
  });

  // Get privacy statistics
  ipcMain.handle('privacy-cleaner:get-stats', async () => {
    try {
      const stats = {
        totalItems: 0,
        totalSize: 0,
        categories: {
          browser: { items: 0, size: 0 },
          system: { items: 0, size: 0 },
          application: { items: 0, size: 0 },
        } as Record<string, { items: number; size: number }>,
      };
      
      // Calculate statistics
      const items = await scanAllPrivacyData();
      stats.totalItems = items.length;
      stats.totalSize = items.reduce((sum, item) => sum + (item.size || 0), 0);
      
      for (const item of items) {
        const category = item.category as keyof typeof stats.categories;
        if (stats.categories[category]) {
          stats.categories[category].items++;
          stats.categories[category].size += item.size || 0;
        }
      }
      
      return stats;
    } catch (error) {
      console.error('Failed to get privacy stats:', error);
      return null;
    }
  });
}

// Helper functions
async function scanBrowsers(): Promise<BrowserData[]> {
  const home = process.env.HOME!;
  const browsers: BrowserData[] = [];
  
  // Safari
  const safariPath = path.join(home, 'Library/Safari');
  if (fs.existsSync(safariPath)) {
    browsers.push({
      browser: 'Safari',
      profilePath: safariPath,
      history: await getBrowserHistory(safariPath, 'History.db'),
      cookies: await getBrowserCookies(safariPath, 'Cookies.binarycookies'),
      cache: await getBrowserCache(path.join(home, 'Library/Caches/com.apple.Safari')),
      downloads: await getBrowserDownloads(safariPath),
      autofill: await getBrowserAutofill(safariPath),
    });
  }
  
  // Chrome
  const chromePath = path.join(home, 'Library/Application Support/Google/Chrome');
  if (fs.existsSync(chromePath)) {
    const defaultProfile = path.join(chromePath, 'Default');
    if (fs.existsSync(defaultProfile)) {
      browsers.push({
        browser: 'Chrome',
        profilePath: defaultProfile,
        history: await getBrowserHistory(defaultProfile, 'History'),
        cookies: await getBrowserCookies(defaultProfile, 'Cookies'),
        cache: await getBrowserCache(path.join(defaultProfile, 'Cache')),
        downloads: await getBrowserDownloads(defaultProfile),
        autofill: await getBrowserAutofill(defaultProfile),
      });
    }
  }
  
  // Firefox
  const firefoxPath = path.join(home, 'Library/Application Support/Firefox/Profiles');
  if (fs.existsSync(firefoxPath)) {
    try {
      const profiles = await readdir(firefoxPath);
      for (const profile of profiles) {
        if (profile.includes('.default')) {
          const profilePath = path.join(firefoxPath, profile);
          browsers.push({
            browser: 'Firefox',
            profilePath,
            history: await getBrowserHistory(profilePath, 'places.sqlite'),
            cookies: await getBrowserCookies(profilePath, 'cookies.sqlite'),
            cache: await getBrowserCache(path.join(profilePath, 'cache2')),
            downloads: await getBrowserDownloads(profilePath),
            autofill: await getBrowserAutofill(profilePath),
          });
          break;
        }
      }
    } catch (e) {
      // Ignore errors
    }
  }
  
  return browsers;
}

async function getBrowserHistory(profilePath: string, historyFile: string) {
  const historyPath = path.join(profilePath, historyFile);
  if (!fs.existsSync(historyPath)) {
    return { count: 0, size: 0, path: historyPath };
  }
  
  try {
    const stats = await stat(historyPath);
    // In a real implementation, you'd parse the database to get accurate count
    return {
      count: Math.floor(stats.size / 1000), // Rough estimate
      size: stats.size,
      path: historyPath,
    };
  } catch {
    return { count: 0, size: 0, path: historyPath };
  }
}

async function getBrowserCookies(profilePath: string, cookieFile: string) {
  const cookiePath = path.join(profilePath, cookieFile);
  if (!fs.existsSync(cookiePath)) {
    return { count: 0, size: 0, path: cookiePath };
  }
  
  try {
    const stats = await stat(cookiePath);
    return {
      count: Math.floor(stats.size / 100), // Rough estimate
      size: stats.size,
      path: cookiePath,
    };
  } catch {
    return { count: 0, size: 0, path: cookiePath };
  }
}

async function getBrowserCache(cachePath: string) {
  if (!fs.existsSync(cachePath)) {
    return { size: 0, path: cachePath };
  }
  
  try {
    const size = await getDirectorySize(cachePath);
    return { size, path: cachePath };
  } catch {
    return { size: 0, path: cachePath };
  }
}

async function getBrowserDownloads(profilePath: string) {
  // Simplified - in reality, you'd check download history database
  return { count: 0, path: profilePath };
}

async function getBrowserAutofill(profilePath: string) {
  // Simplified - in reality, you'd check autofill database
  return { count: 0, path: profilePath };
}

async function scanSystemPrivacy(): Promise<PrivacyItem[]> {
  const home = process.env.HOME!;
  const items: PrivacyItem[] = [];
  
  // Recent documents
  const recentDocsPath = path.join(home, 'Library/Application Support/com.apple.sharedfilelist');
  if (fs.existsSync(recentDocsPath)) {
    items.push({
      id: 'system-recent-docs',
      category: 'system',
      name: 'Recent Documents',
      description: 'Recently opened documents list',
      path: recentDocsPath,
      risk: 'medium',
    });
  }
  
  // Clipboard (check if pasteboard files exist)
  const clipboardPath = path.join(home, 'Library/Caches/com.apple.nsservicescache.plist');
  if (fs.existsSync(clipboardPath)) {
    items.push({
      id: 'system-clipboard',
      category: 'system',
      name: 'Clipboard History',
      description: 'Recently copied items',
      path: clipboardPath,
      risk: 'high',
    });
  }
  
  // Terminal history
  const terminalHistoryPath = path.join(home, '.zsh_history');
  if (fs.existsSync(terminalHistoryPath)) {
    const stats = await stat(terminalHistoryPath);
    items.push({
      id: 'system-terminal',
      category: 'system',
      name: 'Terminal History',
      description: 'Command line history',
      path: terminalHistoryPath,
      size: stats.size,
      risk: 'medium',
    });
  }
  
  // Quick Look cache
  const quickLookPath = path.join(home, 'Library/Caches/com.apple.QuickLook.thumbnailcache');
  if (fs.existsSync(quickLookPath)) {
    items.push({
      id: 'system-quicklook',
      category: 'system',
      name: 'Quick Look Cache',
      description: 'Thumbnails of recently viewed files',
      path: quickLookPath,
      risk: 'low',
    });
  }
  
  return items;
}

async function scanApplicationPrivacy(): Promise<PrivacyItem[]> {
  const home = process.env.HOME!;
  const items: PrivacyItem[] = [];
  
  // Slack
  const slackPath = path.join(home, 'Library/Application Support/Slack');
  if (fs.existsSync(slackPath)) {
    const cachePath = path.join(slackPath, 'Cache');
    if (fs.existsSync(cachePath)) {
      const size = await getDirectorySize(cachePath);
      items.push({
        id: 'app-slack-cache',
        category: 'application',
        name: 'Slack Cache',
        description: 'Cached messages and files from Slack',
        path: cachePath,
        size,
        risk: 'low',
      });
    }
  }
  
  // Messages
  const messagesPath = path.join(home, 'Library/Messages');
  if (fs.existsSync(messagesPath)) {
    items.push({
      id: 'app-messages',
      category: 'application',
      name: 'Messages History',
      description: 'iMessage conversation history',
      path: messagesPath,
      risk: 'high',
    });
  }
  
  // Zoom
  const zoomPath = path.join(home, 'Library/Application Support/zoom.us');
  if (fs.existsSync(zoomPath)) {
    items.push({
      id: 'app-zoom',
      category: 'application',
      name: 'Zoom Data',
      description: 'Zoom meeting history and cache',
      path: zoomPath,
      risk: 'medium',
    });
  }
  
  return items;
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

async function cleanPrivacyItem(itemId: string) {
  // Map item IDs to cleaning actions
  const cleaningMap: Record<string, () => Promise<void>> = {
    'Safari-history': async () => {
      // In production, properly close Safari and clean history
      throw new Error('Safari must be closed to clean history');
    },
    'Chrome-history': async () => {
      // In production, properly close Chrome and clean history
      throw new Error('Chrome must be closed to clean history');
    },
    'system-terminal': async () => {
      const home = process.env.HOME!;
      await unlink(path.join(home, '.zsh_history'));
      await unlink(path.join(home, '.bash_history')).catch(() => {});
    },
    // Add more cleaning actions as needed
  };
  
  const cleaner = cleaningMap[itemId];
  if (cleaner) {
    await cleaner();
  } else {
    throw new Error(`No cleaner implemented for ${itemId}`);
  }
}

async function scanAllPrivacyData(): Promise<PrivacyItem[]> {
  const browserData = await scanBrowsers();
  const systemItems = await scanSystemPrivacy();
  const appItems = await scanApplicationPrivacy();
  
  const allItems: PrivacyItem[] = [];
  
  // Convert browser data to privacy items
  for (const browser of browserData) {
    if (browser.history.count > 0) {
      allItems.push({
        id: `${browser.browser}-history`,
        category: 'browser',
        name: `${browser.browser} History`,
        description: `Browsing history from ${browser.browser}`,
        path: browser.history.path,
        size: browser.history.size,
        risk: 'medium',
      });
    }
    // Add other browser items...
  }
  
  allItems.push(...systemItems);
  allItems.push(...appItems);
  
  return allItems;
}