import { promises as fs } from 'fs';
import path from 'path';
import { FileInfo } from '@/types/ipc/file';
import { isWindows } from '@main/constants';

export default class FileManager {
  private static instance: FileManager | null = null;

  private constructor() {}

  public static getInstance(): FileManager {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager();
    }
    return FileManager.instance;
  }

  private normalizePath(inputPath: string): string {
    return inputPath.startsWith('/') && isWindows
      ? inputPath.slice(1)
      : inputPath;
  }

  public async readDirectory(dirPath: string): Promise<FileInfo[]> {
    try {
      const normalizedPath = this.normalizePath(dirPath);
      const entries = await fs.readdir(normalizedPath, { withFileTypes: true });
      const fileInfos = await Promise.all(
        entries.map(async entry => {
          const fullPath = path.join(normalizedPath, entry.name);
          const stats = await fs.stat(fullPath);

          return {
            name: entry.name,
            path: fullPath,
            isDirectory: entry.isDirectory(),
            size: stats.size,
            modifiedTime: stats.mtime,
            createdTime: stats.birthtime,
          };
        })
      );
      return fileInfos;
    } catch (error) {
      console.error('Read directory error:', error);
      const errorString =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to read directory: ${errorString}`);
    }
  }

  public async createDirectory(dirPath: string): Promise<void> {
    try {
      const normalizedPath = this.normalizePath(dirPath);
      await fs.mkdir(normalizedPath, { recursive: true });
    } catch (error) {
      console.error('Create directory error:', error);
      const errorString =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create directory: ${errorString}`);
    }
  }

  public async createFile(
    filePath: string,
    content: string = ''
  ): Promise<void> {
    try {
      const normalizedPath = this.normalizePath(filePath);
      await fs.writeFile(normalizedPath, content, 'utf-8');
    } catch (error) {
      console.error('Create file error:', error);
      const errorString =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create file: ${errorString}`);
    }
  }

  public async read(
    filePath: string,
    encoding: BufferEncoding = 'utf-8'
  ): Promise<string> {
    try {
      const normalizedPath = this.normalizePath(filePath);
      const content = await fs.readFile(normalizedPath, { encoding });
      return content;
    } catch (error) {
      console.error('Read file error:', error);
      const errorString =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to read file: ${errorString}`);
    }
  }

  public async copy(
    sourcePath: string,
    destinationPath: string
  ): Promise<void> {
    try {
      const normalizedSource = this.normalizePath(sourcePath);
      const normalizedDest = this.normalizePath(destinationPath);
      await this.copyPath(normalizedSource, normalizedDest);
    } catch (error) {
      console.error('Copy error:', error);
      const errorString =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to copy: ${errorString}`);
    }
  }

  public async move(
    sourcePath: string,
    destinationPath: string
  ): Promise<void> {
    try {
      const normalizedSource = this.normalizePath(sourcePath);
      const normalizedDest = this.normalizePath(destinationPath);
      await fs.rename(normalizedSource, normalizedDest);
    } catch (error) {
      console.error('Move error:', error);
      const errorString =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to move: ${errorString}`);
    }
  }

  public async delete(targetPath: string): Promise<void> {
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
      const errorString =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete: ${errorString}`);
    }
  }

  public async getInfo(targetPath: string): Promise<FileInfo> {
    try {
      const normalizedPath = this.normalizePath(targetPath);
      const stats = await fs.stat(normalizedPath);
      return {
        name: path.basename(normalizedPath),
        path: normalizedPath,
        isDirectory: stats.isDirectory(),
        size: stats.size,
        modifiedTime: stats.mtime,
        createdTime: stats.birthtime,
      };
    } catch (error) {
      console.error('Get info error:', error);
      const errorString =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get file info: ${errorString}`);
    }
  }

  public async exists(targetPath: string): Promise<boolean> {
    try {
      const normalizedPath = this.normalizePath(targetPath);
      await fs.access(normalizedPath);
      return true;
    } catch {
      return false;
    }
  }

  private async copyPath(
    sourcePath: string,
    destinationPath: string
  ): Promise<void> {
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
