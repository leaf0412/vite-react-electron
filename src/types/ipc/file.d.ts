export interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedTime: Date;
  createdTime: Date;
}

export interface FileOperations {
  readDirectory(dirPath: string): Promise<FileInfo[]>;
  createDirectory(dirPath: string): Promise<void>;
  createFile(filePath: string, content?: string): Promise<void>;
  readFile(filePath: string, encoding?: BufferEncoding): Promise<string>;
  copyFile(sourcePath: string, destinationPath: string): Promise<void>;
  moveFile(sourcePath: string, destinationPath: string): Promise<void>;
  deleteFile(targetPath: string): Promise<void>;
  getFileInfo(targetPath: string): Promise<FileInfo>;
  existsFile(targetPath: string): Promise<boolean>;
} 