export interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedTime: Date;
  createdTime: Date;
}

export interface IpcResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface FileOperations {
  readDirectory(dirPath: string): Promise<IpcResponse<FileInfo[]>>;
  createDirectory(dirPath: string): Promise<IpcResponse<void>>;
  createFile(filePath: string, content?: string): Promise<IpcResponse<void>>;
  readFile(filePath: string, encoding?: BufferEncoding): Promise<IpcResponse<string>>;
  copyFile(sourcePath: string, destinationPath: string): Promise<IpcResponse<void>>;
  moveFile(sourcePath: string, destinationPath: string): Promise<IpcResponse<void>>;
  deleteFile(targetPath: string): Promise<IpcResponse<void>>;
  getFileInfo(targetPath: string): Promise<IpcResponse<FileInfo>>;
  existsFile(targetPath: string): Promise<IpcResponse<boolean>>;
} 