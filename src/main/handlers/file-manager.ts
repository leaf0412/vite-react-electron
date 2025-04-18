import { promises as fs } from 'fs'
import path from 'path'
import { ipcMain } from 'electron'
import { FileManagerEvents } from '@/main/ipc/ipc-events'

export const Events = FileManagerEvents;

export interface FileInfo {
  name: string
  path: string
  isDirectory: boolean
  size: number
  modifiedTime: Date
  createdTime: Date
}

export class FileManager {
  private static instance: FileManager | null = null;

  private constructor() {
    this.registerHandlers();
  }

  public static getInstance(): FileManager {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager();
    }
    return FileManager.instance;
  }

  public static destroyInstance(): void {
    if (FileManager.instance) {
      FileManager.instance.unregisterHandlers();
      FileManager.instance = null;
    }
  }

  private registerHandlers(): void {
    ipcMain.handle(Events.FILE_READ_DIRECTORY, this.handleReadDirectory.bind(this));
    ipcMain.handle(Events.FILE_CREATE_DIRECTORY, this.handleCreateDirectory.bind(this));
    ipcMain.handle(Events.FILE_CREATE_FILE, this.handleCreateFile.bind(this));
    ipcMain.handle(Events.FILE_READ, this.handleRead.bind(this));
    ipcMain.handle(Events.FILE_COPY, this.handleCopy.bind(this));
    ipcMain.handle(Events.FILE_MOVE, this.handleMove.bind(this));
    ipcMain.handle(Events.FILE_DELETE, this.handleDelete.bind(this));
    ipcMain.handle(Events.FILE_GET_INFO, this.handleGetInfo.bind(this));
    ipcMain.handle(Events.FILE_EXISTS, this.handleExists.bind(this));
  }

  private unregisterHandlers(): void {
    Object.values(Events).forEach(event => {
      ipcMain.removeHandler(event);
    });
  }

  private normalizePath(inputPath: string): string {
    // Remove any leading slash for Windows compatibility
    return inputPath.startsWith('/') && process.platform === 'win32'
      ? inputPath.slice(1)
      : inputPath;
  }

  private async handleReadDirectory(_event: Electron.IpcMainInvokeEvent, dirPath: string): Promise<FileInfo[]> {
    try {
      const normalizedPath = this.normalizePath(dirPath);
      const entries = await fs.readdir(normalizedPath, { withFileTypes: true });
      const fileInfos = await Promise.all(
        entries.map(async (entry) => {
          const fullPath = path.join(normalizedPath, entry.name);
          const stats = await fs.stat(fullPath);
          
          return {
            name: entry.name,
            path: fullPath,
            isDirectory: entry.isDirectory(),
            size: stats.size,
            modifiedTime: stats.mtime,
            createdTime: stats.birthtime
          };
        })
      );
      return fileInfos;
    } catch (error) {
      console.error('Read directory error:', error);
      const errorString = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to read directory: ${errorString}`);
    }
  }

  private async handleCreateDirectory(_event: Electron.IpcMainInvokeEvent, dirPath: string): Promise<void> {
    try {
      const normalizedPath = this.normalizePath(dirPath);
      await fs.mkdir(normalizedPath, { recursive: true });
    } catch (error) {
      console.error('Create directory error:', error);
      const errorString = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create directory: ${errorString}`);
    }
  }

  private async handleCreateFile(
    _event: Electron.IpcMainInvokeEvent,
    filePath: string,
    content: string = ''
  ): Promise<void> {
    try {
      const normalizedPath = this.normalizePath(filePath);
      await fs.writeFile(normalizedPath, content, 'utf-8');
    } catch (error) {
      console.error('Create file error:', error);
      const errorString = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create file: ${errorString}`);
    }
  }

  private async handleCopy(
    _event: Electron.IpcMainInvokeEvent,
    sourcePath: string,
    destinationPath: string
  ): Promise<void> {
    try {
      const normalizedSource = this.normalizePath(sourcePath);
      const normalizedDest = this.normalizePath(destinationPath);
      await this.copyPath(normalizedSource, normalizedDest);
    } catch (error) {
      console.error('Copy error:', error);
      const errorString = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to copy: ${errorString}`);
    }
  }

  private async handleMove(
    _event: Electron.IpcMainInvokeEvent,
    sourcePath: string,
    destinationPath: string
  ): Promise<void> {
    try {
      const normalizedSource = this.normalizePath(sourcePath);
      const normalizedDest = this.normalizePath(destinationPath);
      await fs.rename(normalizedSource, normalizedDest);
    } catch (error) {
      console.error('Move error:', error);
      const errorString = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to move: ${errorString}`);
    }
  }

  private async handleDelete(_event: Electron.IpcMainInvokeEvent, targetPath: string): Promise<void> {
    try {
      const normalizedPath = this.normalizePath(targetPath);
      const stats = await fs.stat(normalizedPath);
      
      if (stats.isDirectory()) {
        await fs.rm(normalizedPath, { recursive: true, force: true });
      } else {
        await fs.unlink(normalizedPath);
      }
    } catch (error) {
      console.error('Delete error:', error);
      const errorString = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete: ${errorString}`);
    }
  }

  private async handleGetInfo(_event: Electron.IpcMainInvokeEvent, targetPath: string): Promise<FileInfo> {
    try {
      const normalizedPath = this.normalizePath(targetPath);
      const stats = await fs.stat(normalizedPath);
      return {
        name: path.basename(normalizedPath),
        path: normalizedPath,
        isDirectory: stats.isDirectory(),
        size: stats.size,
        modifiedTime: stats.mtime,
        createdTime: stats.birthtime
      };
    } catch (error) {
      console.error('Get info error:', error);
      const errorString = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get file info: ${errorString}`);
    }
  }

  private async handleExists(_event: Electron.IpcMainInvokeEvent, targetPath: string): Promise<boolean> {
    try {
      const normalizedPath = this.normalizePath(targetPath);
      await fs.access(normalizedPath);
      return true;
    } catch {
      return false;
    }
  }

  private async handleRead(
    _event: Electron.IpcMainInvokeEvent,
    filePath: string,
    encoding: BufferEncoding = 'utf-8'
  ): Promise<string> {
    try {
      const normalizedPath = this.normalizePath(filePath);
      const content = await fs.readFile(normalizedPath, { encoding });
      return content;
    } catch (error) {
      console.error('Read file error:', error);
      const errorString = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to read file: ${errorString}`);
    }
  }

  private async copyPath(sourcePath: string, destinationPath: string): Promise<void> {
    const stats = await fs.stat(sourcePath);
    
    if (stats.isDirectory()) {
      await fs.mkdir(destinationPath, { recursive: true });
      const files = await fs.readdir(sourcePath);
      
      for (const file of files) {
        const srcPath = path.join(sourcePath, file);
        const destPath = path.join(destinationPath, file);
        await this.copyPath(srcPath, destPath);
      }
    } else {
      await fs.copyFile(sourcePath, destinationPath);
    }
  }
}

// Export initialization and cleanup functions for consistency with other handlers
export function initFileManagerIpcHandlers(): void {
  FileManager.getInstance();
}

export function destroyFileManagerIpcHandlers(): void {
  FileManager.destroyInstance();
}
