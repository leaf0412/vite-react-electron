/// <reference types="vite-electron-plugin/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    DIST: string
    VITE_PUBLIC: string
  }
}

type WindowOptions = Electron.BrowserWindowConstructorOptions & {
  id?: number;
  route?: string;
  isMultiWindow?: boolean;
  isMainWin?: boolean;
  maximize?: boolean;
  parentId?: number;
  isDevTools?: boolean;
};

type DialogType = 'none' | 'info' | 'error' | 'question' | 'warning';

interface DialogOptions {
  title?: string;
  message: string;
  detail?: string;
  type?: DialogType;
  buttons?: string[];
  defaultId?: number;
}

interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedTime: Date;
  createdTime: Date;
}

type ListenerType = 'once' | 'on' | 'off';

type IpcRendererEventCallback<T = void> = T extends void
  ? (event: Electron.IpcRendererEvent) => void
  : (event: Electron.IpcRendererEvent, ...args: T) => void;

interface Window {
  ipcRenderer: import('electron').IpcRenderer & {
    // System information
    platform: string;
    homedir: string;

    // Window operations
    newWindow(options?: WindowOptions): Promise<number>;
    closeWindow(winId?: number): Promise<void>;
    hideWindow(winId?: number): Promise<void>;
    showWindow(winId?: number): Promise<void>;
    focusWindow(winId?: number): Promise<void>;
    getWindowId(): Promise<number>;
    minimizeWindow(winId?: number): Promise<void>;
    maximizeWindow(winId?: number): Promise<void>;
    toggleMaximize(winId?: number): Promise<void>;
    restoreWindow(winId?: number): Promise<void>;
    reloadWindow(winId?: number): Promise<void>;
    getWindowBounds(): Promise<Electron.Rectangle>;
    getDisplayInfo(): Promise<Electron.Display[]>;

    // Dialog operations
    openDialog(options: Electron.OpenDialogOptions): Promise<Electron.OpenDialogReturnValue>;
    saveDialog(options: Electron.SaveDialogOptions): Promise<Electron.SaveDialogReturnValue>;
    showMessage(options: DialogOptions): Promise<Electron.MessageBoxReturnValue>;
    showError(options: Omit<DialogOptions, 'type'>): Promise<Electron.MessageBoxReturnValue>;
    showInfo(options: Omit<DialogOptions, 'type'>): Promise<Electron.MessageBoxReturnValue>;
    showWarning(options: Omit<DialogOptions, 'type'>): Promise<Electron.MessageBoxReturnValue>;
    showQuestion(options: Omit<DialogOptions, 'type'>): Promise<Electron.MessageBoxReturnValue>;

    // File Manager operations
    readDirectory(dirPath: string): Promise<FileInfo[]>;
    createDirectory(dirPath: string): Promise<void>;
    createFile(filePath: string, content?: string): Promise<void>;
    readFile(filePath: string, encoding?: BufferEncoding): Promise<string>;
    copy(sourcePath: string, destinationPath: string): Promise<void>;
    move(sourcePath: string, destinationPath: string): Promise<void>;
    delete(targetPath: string): Promise<void>;
    getInfo(targetPath: string): Promise<FileInfo>;
    exists(targetPath: string): Promise<boolean>;

    // Event listeners
    startupLoadingProgress(status: ListenerType, callback: IpcRendererEventCallback<[number]>): void;
    mainWindowReady(): void;
    getLanguage(): Promise<string>;
    checkForUpdates(): Promise<UpdateInfo>;
    downloadUpdate(): Promise<UpdateInfo>;
    installUpdate(): Promise<void>;
    upgradeProgress(status: ListenerType, callback: IpcRendererEventCallback<[number]>): void;
  }
}
