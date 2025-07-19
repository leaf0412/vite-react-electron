import { promises as fs } from 'fs';
import path from 'path';
import { Logger } from '../../core/logger';
import { normalizePath } from '../../shared/utils';
import type { FileInfo, CreateFileOptions } from '../../shared/types';

export class FileService {
  private logger = Logger.create('FileService');

  constructor() {
    this.logger.info('FileService initialized');
  }

  async readDirectory(dirPath: string): Promise<FileInfo[]> {
    try {
      const normalizedPath = normalizePath(dirPath);
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
      
      this.logger.debug(`Read directory: ${dirPath} (${fileInfos.length} items)`);
      return fileInfos;
    } catch (error) {
      this.logger.error('Failed to read directory:', error);
      throw new Error(`Failed to read directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createDirectory(dirPath: string): Promise<void> {
    try {
      const normalizedPath = normalizePath(dirPath);
      await fs.mkdir(normalizedPath, { recursive: true });
      this.logger.info(`Directory created: ${dirPath}`);
    } catch (error) {
      this.logger.error('Failed to create directory:', error);
      throw new Error(`Failed to create directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createFile(filePath: string, options: CreateFileOptions = {}): Promise<void> {
    try {
      const { content = '', encoding = 'utf8', overwrite = false } = options;
      const normalizedPath = normalizePath(filePath);
      
      if (!overwrite && await this.fileExists(normalizedPath)) {
        throw new Error('File already exists');
      }

      await fs.writeFile(normalizedPath, content, encoding);
      this.logger.info(`File created: ${filePath}`);
    } catch (error) {
      this.logger.error('Failed to create file:', error);
      throw new Error(`Failed to create file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async readFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
    try {
      const normalizedPath = normalizePath(filePath);
      const content = await fs.readFile(normalizedPath, encoding);
      this.logger.debug(`File read: ${filePath}`);
      return content;
    } catch (error) {
      this.logger.error('Failed to read file:', error);
      throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async copyFile(sourcePath: string, destPath: string): Promise<void> {
    try {
      const normalizedSource = normalizePath(sourcePath);
      const normalizedDest = normalizePath(destPath);
      
      await fs.copyFile(normalizedSource, normalizedDest);
      this.logger.info(`File copied: ${sourcePath} -> ${destPath}`);
    } catch (error) {
      this.logger.error('Failed to copy file:', error);
      throw new Error(`Failed to copy file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async moveFile(sourcePath: string, destPath: string): Promise<void> {
    try {
      const normalizedSource = normalizePath(sourcePath);
      const normalizedDest = normalizePath(destPath);
      
      await fs.rename(normalizedSource, normalizedDest);
      this.logger.info(`File moved: ${sourcePath} -> ${destPath}`);
    } catch (error) {
      this.logger.error('Failed to move file:', error);
      throw new Error(`Failed to move file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const normalizedPath = normalizePath(filePath);
      const stats = await fs.stat(normalizedPath);
      
      if (stats.isDirectory()) {
        await fs.rmdir(normalizedPath, { recursive: true });
      } else {
        await fs.unlink(normalizedPath);
      }
      
      this.logger.info(`File deleted: ${filePath}`);
    } catch (error) {
      this.logger.error('Failed to delete file:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getFileInfo(filePath: string): Promise<FileInfo> {
    try {
      const normalizedPath = normalizePath(filePath);
      const stats = await fs.stat(normalizedPath);
      
      const fileInfo: FileInfo = {
        name: path.basename(normalizedPath),
        path: normalizedPath,
        isDirectory: stats.isDirectory(),
        size: stats.size,
        modifiedTime: stats.mtime,
        createdTime: stats.birthtime,
      };
      
      return fileInfo;
    } catch (error) {
      this.logger.error('Failed to get file info:', error);
      throw new Error(`Failed to get file info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      const normalizedPath = normalizePath(filePath);
      await fs.access(normalizedPath);
      return true;
    } catch {
      return false;
    }
  }
} 