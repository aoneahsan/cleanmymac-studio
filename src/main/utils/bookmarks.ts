import { app, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const exists = promisify(fs.exists);

interface BookmarkData {
  path: string;
  bookmark: string;
  name: string;
  createdAt: Date;
}

class SecurityScopedBookmarks {
  private bookmarksFile: string;
  private bookmarks: Map<string, BookmarkData>;

  constructor() {
    this.bookmarksFile = path.join(app.getPath('userData'), 'bookmarks.json');
    this.bookmarks = new Map();
    this.loadBookmarks();
  }

  private async loadBookmarks() {
    try {
      if (await exists(this.bookmarksFile)) {
        const data = await readFile(this.bookmarksFile, 'utf8');
        const bookmarksArray: BookmarkData[] = JSON.parse(data);
        bookmarksArray.forEach(bookmark => {
          this.bookmarks.set(bookmark.path, bookmark);
        });
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    }
  }

  private async saveBookmarks() {
    try {
      const bookmarksArray = Array.from(this.bookmarks.values());
      await writeFile(this.bookmarksFile, JSON.stringify(bookmarksArray, null, 2));
    } catch (error) {
      console.error('Failed to save bookmarks:', error);
    }
  }

  async createBookmark(filePath: string): Promise<string | null> {
    try {
      // In a sandboxed app, we need to use the native API to create security-scoped bookmarks
      // This is a simplified version - in production, you'd use native macOS APIs
      const bookmark = Buffer.from(filePath).toString('base64');
      
      const bookmarkData: BookmarkData = {
        path: filePath,
        bookmark,
        name: path.basename(filePath),
        createdAt: new Date()
      };

      this.bookmarks.set(filePath, bookmarkData);
      await this.saveBookmarks();
      
      return bookmark;
    } catch (error) {
      console.error('Failed to create bookmark:', error);
      return null;
    }
  }

  async resolveBookmark(bookmark: string): Promise<string | null> {
    try {
      // In production, this would resolve the security-scoped bookmark
      // and start accessing the resource
      const filePath = Buffer.from(bookmark, 'base64').toString('utf8');
      
      // Verify the bookmark still exists in our records
      if (this.bookmarks.has(filePath)) {
        return filePath;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to resolve bookmark:', error);
      return null;
    }
  }

  async stopAccessingBookmark(bookmark: string) {
    // In production, this would stop accessing the security-scoped resource
    // to release the security context
  }

  async requestFolderAccess(title: string = 'Select Folder'): Promise<string | null> {
    const result = await dialog.showOpenDialog({
      title,
      properties: ['openDirectory', 'createDirectory'],
      securityScopedBookmarks: true // Enable security-scoped bookmarks
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const folderPath = result.filePaths[0];
      
      // If we have bookmarks from the dialog, use them
      if (result.bookmarks && result.bookmarks.length > 0) {
        const bookmarkData: BookmarkData = {
          path: folderPath,
          bookmark: result.bookmarks[0],
          name: path.basename(folderPath),
          createdAt: new Date()
        };
        
        this.bookmarks.set(folderPath, bookmarkData);
        await this.saveBookmarks();
        
        return folderPath;
      }
      
      // Fallback: create our own bookmark
      await this.createBookmark(folderPath);
      return folderPath;
    }

    return null;
  }

  async requestFileAccess(title: string = 'Select File'): Promise<string | null> {
    const result = await dialog.showOpenDialog({
      title,
      properties: ['openFile'],
      securityScopedBookmarks: true
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      
      if (result.bookmarks && result.bookmarks.length > 0) {
        const bookmarkData: BookmarkData = {
          path: filePath,
          bookmark: result.bookmarks[0],
          name: path.basename(filePath),
          createdAt: new Date()
        };
        
        this.bookmarks.set(filePath, bookmarkData);
        await this.saveBookmarks();
        
        return filePath;
      }
      
      await this.createBookmark(filePath);
      return filePath;
    }

    return null;
  }

  getBookmarkedPaths(): string[] {
    return Array.from(this.bookmarks.keys());
  }

  getBookmarkData(filePath: string): BookmarkData | undefined {
    return this.bookmarks.get(filePath);
  }

  async removeBookmark(filePath: string): Promise<boolean> {
    if (this.bookmarks.has(filePath)) {
      this.bookmarks.delete(filePath);
      await this.saveBookmarks();
      return true;
    }
    return false;
  }

  hasBookmark(filePath: string): boolean {
    return this.bookmarks.has(filePath);
  }

  async accessPath(filePath: string): Promise<boolean> {
    // Check if we have a bookmark for this path
    const bookmarkData = this.bookmarks.get(filePath);
    if (bookmarkData) {
      const resolvedPath = await this.resolveBookmark(bookmarkData.bookmark);
      return resolvedPath !== null;
    }

    // Check if path is within an already bookmarked directory
    for (const [bookmarkedPath] of this.bookmarks) {
      if (filePath.startsWith(bookmarkedPath + path.sep)) {
        return true;
      }
    }

    return false;
  }
}

// Export singleton instance
export const bookmarks = new SecurityScopedBookmarks();

// IPC handlers for bookmark management
import { ipcMain } from 'electron';

export function registerBookmarkHandlers() {
  ipcMain.handle('bookmarks:request-folder', async (event, title?: string) => {
    return bookmarks.requestFolderAccess(title);
  });

  ipcMain.handle('bookmarks:request-file', async (event, title?: string) => {
    return bookmarks.requestFileAccess(title);
  });

  ipcMain.handle('bookmarks:get-all', async () => {
    return bookmarks.getBookmarkedPaths();
  });

  ipcMain.handle('bookmarks:remove', async (event, filePath: string) => {
    return bookmarks.removeBookmark(filePath);
  });

  ipcMain.handle('bookmarks:has-access', async (event, filePath: string) => {
    return bookmarks.accessPath(filePath);
  });
}