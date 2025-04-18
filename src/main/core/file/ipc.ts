import { ipcMain } from 'electron';
import FileManager from '@main/core/file';
import { FileManagerEvents } from '@main/core/file/event';

class FileIpcHandler {
  private fileManager: FileManager;

  constructor() {
    this.fileManager = FileManager.getInstance();
  }

  initIpcHandlers() {
    ipcMain.handle(
      FileManagerEvents.FILE_READ_DIRECTORY,
      this.handleReadDirectory.bind(this)
    );
    ipcMain.handle(
      FileManagerEvents.FILE_CREATE_DIRECTORY,
      this.handleCreateDirectory.bind(this)
    );
    ipcMain.handle(
      FileManagerEvents.FILE_CREATE_FILE,
      this.handleCreateFile.bind(this)
    );
    ipcMain.handle(FileManagerEvents.FILE_READ, this.handleRead.bind(this));
    ipcMain.handle(FileManagerEvents.FILE_COPY, this.handleCopy.bind(this));
    ipcMain.handle(FileManagerEvents.FILE_MOVE, this.handleMove.bind(this));
    ipcMain.handle(FileManagerEvents.FILE_DELETE, this.handleDelete.bind(this));
    ipcMain.handle(
      FileManagerEvents.FILE_GET_INFO,
      this.handleGetInfo.bind(this)
    );
    ipcMain.handle(FileManagerEvents.FILE_EXISTS, this.handleExists.bind(this));
  }

  destroyIpcHandlers() {
    Object.values(FileManagerEvents).forEach(event => {
      ipcMain.removeHandler(event);
    });
  }

  private async handleReadDirectory(
    _event: Electron.IpcMainInvokeEvent,
    dirPath: string
  ) {
    return this.fileManager.readDirectory(dirPath);
  }

  private async handleCreateDirectory(
    _event: Electron.IpcMainInvokeEvent,
    dirPath: string
  ) {
    return this.fileManager.createDirectory(dirPath);
  }

  private async handleCreateFile(
    _event: Electron.IpcMainInvokeEvent,
    filePath: string,
    content: string = ''
  ) {
    return this.fileManager.createFile(filePath, content);
  }

  private async handleRead(
    _event: Electron.IpcMainInvokeEvent,
    filePath: string,
    encoding: BufferEncoding = 'utf-8'
  ) {
    return this.fileManager.read(filePath, encoding);
  }

  private async handleCopy(
    _event: Electron.IpcMainInvokeEvent,
    sourcePath: string,
    destinationPath: string
  ) {
    return this.fileManager.copy(sourcePath, destinationPath);
  }

  private async handleMove(
    _event: Electron.IpcMainInvokeEvent,
    sourcePath: string,
    destinationPath: string
  ) {
    return this.fileManager.move(sourcePath, destinationPath);
  }

  private async handleDelete(
    _event: Electron.IpcMainInvokeEvent,
    targetPath: string
  ) {
    return this.fileManager.delete(targetPath);
  }

  private async handleGetInfo(
    _event: Electron.IpcMainInvokeEvent,
    targetPath: string
  ) {
    return this.fileManager.getInfo(targetPath);
  }

  private async handleExists(
    _event: Electron.IpcMainInvokeEvent,
    targetPath: string
  ) {
    return this.fileManager.exists(targetPath);
  }
}

export default FileIpcHandler;
