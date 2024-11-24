/// <reference types="vite-electron-plugin/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    DIST: string
    VITE_PUBLIC: string
  }
}

type WindowOptions = BrowserWindowConstructorOptions & {
  id?: number;
};

interface DialogOptions {
  title?: string
  message: string
  detail?: string
  type?: 'none' | 'info' | 'error' | 'question' | 'warning'
  buttons?: string[]
  defaultId?: number
}

interface FileInfo {
  name: string
  path: string
  isDirectory: boolean
  size: number
  modifiedTime: Date
  createdTime: Date
}

interface Window {
  ipcRenderer: import('electron').IpcRenderer & {
    // System information
    platform: string;
    homedir: string;

    // Window operations
    newWindow(options?: WindowOptions): Promise<number>
    closeWindow(winId?: number): Promise<void>
    hideWindow(winId?: number): Promise<void>
    showWindow(winId?: number): Promise<void>
    focusWindow(winId?: number): Promise<void>
    getWindowId(): Promise<number>
    minimizeWindow(winId?: number): Promise<void>
    maximizeWindow(winId?: number): Promise<void>
    toggleMaximize(winId?: number): Promise<void>
    restoreWindow(winId?: number): Promise<void>
    reloadWindow(winId?: number): Promise<void>
    getWindowBounds(): Promise<Electron.Rectangle>
    getDisplayInfo(): Promise<Electron.Display[]>

    // Dialog operations
    openDialog(options: Electron.OpenDialogOptions): Promise<Electron.OpenDialogReturnValue>
    saveDialog(options: Electron.SaveDialogOptions): Promise<Electron.SaveDialogReturnValue>
    showMessage(options: DialogOptions): Promise<Electron.MessageBoxReturnValue>
    showError(options: DialogOptions): Promise<Electron.MessageBoxReturnValue>
    showInfo(options: DialogOptions): Promise<Electron.MessageBoxReturnValue>
    showWarning(options: DialogOptions): Promise<Electron.MessageBoxReturnValue>
    showQuestion(options: DialogOptions): Promise<Electron.MessageBoxReturnValue>

    // File Manager operations
    readDirectory(dirPath: string): Promise<FileInfo[]>
    createDirectory(dirPath: string): Promise<void>
    createFile(filePath: string, content?: string): Promise<void>
    readFile(filePath: string, encoding?: BufferEncoding): Promise<string>
    copy(sourcePath: string, destinationPath: string): Promise<void>
    move(sourcePath: string, destinationPath: string): Promise<void>
    delete(targetPath: string): Promise<void>
    getInfo(targetPath: string): Promise<FileInfo>
    exists(targetPath: string): Promise<boolean>
  }
}
