import { ipcMain } from 'electron';
import { FileService } from './service';
import { Logger } from '../../core/logger';
import { Events } from '../../shared/constants';
import type { CreateFileOptions } from '../../shared/types';

export class FileIpcHandler {
  private logger = Logger.create('FileIpcHandler');

  constructor(private fileService: FileService) {}

  register(): void {
    // 读取目录
    ipcMain.handle(Events.FILE_READ_DIRECTORY, async (_, dirPath: string) => {
      return this.handleAsync(() => this.fileService.readDirectory(dirPath));
    });

    // 创建目录
    ipcMain.handle(Events.FILE_CREATE_DIRECTORY, async (_, dirPath: string) => {
      return this.handleAsync(() => this.fileService.createDirectory(dirPath));
    });

    // 创建文件
    ipcMain.handle(Events.FILE_CREATE_FILE, async (_, filePath: string, options?: CreateFileOptions) => {
      return this.handleAsync(() => this.fileService.createFile(filePath, options));
    });

    // 读取文件
    ipcMain.handle(Events.FILE_READ_FILE, async (_, filePath: string, encoding?: BufferEncoding) => {
      return this.handleAsync(() => this.fileService.readFile(filePath, encoding));
    });

    // 复制文件
    ipcMain.handle(Events.FILE_COPY_FILE, async (_, sourcePath: string, destPath: string) => {
      return this.handleAsync(() => this.fileService.copyFile(sourcePath, destPath));
    });

    // 移动文件
    ipcMain.handle(Events.FILE_MOVE_FILE, async (_, sourcePath: string, destPath: string) => {
      return this.handleAsync(() => this.fileService.moveFile(sourcePath, destPath));
    });

    // 删除文件
    ipcMain.handle(Events.FILE_DELETE_FILE, async (_, filePath: string) => {
      return this.handleAsync(() => this.fileService.deleteFile(filePath));
    });

    // 获取文件信息
    ipcMain.handle(Events.FILE_GET_INFO, async (_, filePath: string) => {
      return this.handleAsync(() => this.fileService.getFileInfo(filePath));
    });

    // 检查文件是否存在
    ipcMain.handle(Events.FILE_EXISTS, async (_, filePath: string) => {
      return this.handleAsync(() => this.fileService.fileExists(filePath));
    });

    this.logger.info('File IPC handlers registered');
  }

  unregister(): void {
    const events = [
      Events.FILE_READ_DIRECTORY,
      Events.FILE_CREATE_DIRECTORY,
      Events.FILE_CREATE_FILE,
      Events.FILE_READ_FILE,
      Events.FILE_COPY_FILE,
      Events.FILE_MOVE_FILE,
      Events.FILE_DELETE_FILE,
      Events.FILE_GET_INFO,
      Events.FILE_EXISTS,
    ];

    events.forEach(event => {
      ipcMain.removeHandler(event);
    });

    this.logger.info('File IPC handlers unregistered');
  }

  private async handleAsync<T>(operation: () => Promise<T>) {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('IPC operation failed:', error);
      return { success: false, error: message };
    }
  }
} 