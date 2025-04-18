import { ipcRenderer } from 'electron';
import { Events } from '@main/ipc/ipc-events';

export const fileApi = {
  readDirectory: (dirPath: string) =>
    ipcRenderer.invoke(Events.FILE_READ_DIRECTORY, dirPath),
  createDirectory: (dirPath: string) =>
    ipcRenderer.invoke(Events.FILE_CREATE_DIRECTORY, dirPath),
  createFile: (filePath: string, content?: string) =>
    ipcRenderer.invoke(Events.FILE_CREATE_FILE, filePath, content),
  readFile: (filePath: string, encoding?: BufferEncoding) =>
    ipcRenderer.invoke(Events.FILE_READ, filePath, encoding),
  copyFile: (sourcePath: string, destinationPath: string) =>
    ipcRenderer.invoke(Events.FILE_COPY, sourcePath, destinationPath),
  moveFile: (sourcePath: string, destinationPath: string) =>
    ipcRenderer.invoke(Events.FILE_MOVE, sourcePath, destinationPath),
  deleteFile: (targetPath: string) =>
    ipcRenderer.invoke(Events.FILE_DELETE, targetPath),
  getFileInfo: (targetPath: string) =>
    ipcRenderer.invoke(Events.FILE_GET_INFO, targetPath),
  existsFile: (targetPath: string) =>
    ipcRenderer.invoke(Events.FILE_EXISTS, targetPath),
};
