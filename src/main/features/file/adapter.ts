import { FileService } from './service';

// 向后兼容的适配器，保持原有的 FileManager API
export default class FileManager {
  private static instance: FileManager | null = null;
  private fileService: FileService;

  private constructor() {
    this.fileService = new FileService();
  }

  public static getInstance(): FileManager {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager();
    }
    return FileManager.instance;
  }

  // 代理所有方法到新的 FileService
  public async readDirectory(dirPath: string) {
    return this.fileService.readDirectory(dirPath);
  }

  public async createDirectory(dirPath: string) {
    return this.fileService.createDirectory(dirPath);
  }

  public async createFile(filePath: string, content: string = '') {
    return this.fileService.createFile(filePath, { content });
  }

  public async read(filePath: string, encoding: BufferEncoding = 'utf8') {
    return this.fileService.readFile(filePath, encoding);
  }

  public async copy(sourcePath: string, destinationPath: string) {
    return this.fileService.copyFile(sourcePath, destinationPath);
  }

  public async move(sourcePath: string, destinationPath: string) {
    return this.fileService.moveFile(sourcePath, destinationPath);
  }

  public async delete(filePath: string) {
    return this.fileService.deleteFile(filePath);
  }

  public async getInfo(filePath: string) {
    return this.fileService.getFileInfo(filePath);
  }

  public async exists(filePath: string) {
    return this.fileService.fileExists(filePath);
  }
} 