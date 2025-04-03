import {
  ipcRenderer,
  contextBridge,
  OpenDialogOptions,
  SaveDialogOptions,
} from 'electron';
import { Events } from '@electron/config/ipc-events';

const handleEvent = (
  status: ListenerType,
  channel: string,
  callback: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void
) => {
  const wrappedCallback = (
    event: Electron.IpcRendererEvent,
    ...args: unknown[]
  ) => callback(event, ...args);
  if (status === 'once') {
    return ipcRenderer.once(channel, wrappedCallback);
  }
  if (status === 'on') {
    return ipcRenderer.on(channel, wrappedCallback);
  }
  if (status === 'off') {
    return ipcRenderer.off(channel, wrappedCallback);
  }
};

// --------- Expose some API to the Renderer process ---------
const api = {
  // System information
  platform: process.platform,
  homedir: process.env.HOME || process.env.USERPROFILE || '',

  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },

  // Window operations
  newWindow: (options: WindowOptions) =>
    ipcRenderer.invoke(Events.WINDOW_NEW, options),
  closeWindow: (winId?: number) =>
    ipcRenderer.invoke(Events.WINDOW_CLOSED, winId),
  hideWindow: (winId?: number) => ipcRenderer.invoke(Events.WINDOW_HIDE, winId),
  showWindow: (winId?: number) => ipcRenderer.invoke(Events.WINDOW_SHOW, winId),
  focusWindow: (winId?: number) =>
    ipcRenderer.invoke(Events.WINDOW_FOCUS, winId),
  getWindowId: () => ipcRenderer.invoke(Events.WINDOW_ID),
  minimizeWindow: (winId?: number) =>
    ipcRenderer.invoke(Events.WINDOW_MINI, winId),
  maximizeWindow: (winId?: number) =>
    ipcRenderer.invoke(Events.WINDOW_MAX, winId),
  toggleMaximize: (winId?: number) =>
    ipcRenderer.invoke(Events.WINDOW_MAX_MIN_SIZE, winId),
  restoreWindow: (winId?: number) =>
    ipcRenderer.invoke(Events.WINDOW_RESTORE, winId),
  reloadWindow: (winId?: number) =>
    ipcRenderer.invoke(Events.WINDOW_RELOAD, winId),
  getWindowBounds: () => ipcRenderer.invoke(Events.WINDOW_GET_BOUNDS),
  getDisplayInfo: () => ipcRenderer.invoke(Events.SCREEN_GET_DISPLAY_INFO),

  // Dialog operations
  openDialog: (options: OpenDialogOptions) =>
    ipcRenderer.invoke(Events.DIALOG_OPEN, options),
  saveDialog: (options: SaveDialogOptions) =>
    ipcRenderer.invoke(Events.DIALOG_SAVE, options),
  showMessage: (options: DialogOptions) =>
    ipcRenderer.invoke(Events.DIALOG_MESSAGE, options),
  showError: (options: Omit<DialogOptions, 'type'>) =>
    ipcRenderer.invoke(Events.DIALOG_ERROR, options),
  showInfo: (options: Omit<DialogOptions, 'type'>) =>
    ipcRenderer.invoke(Events.DIALOG_INFO, options),
  showWarning: (options: Omit<DialogOptions, 'type'>) =>
    ipcRenderer.invoke(Events.DIALOG_WARNING, options),
  showQuestion: (options: Omit<DialogOptions, 'type'>) =>
    ipcRenderer.invoke(Events.DIALOG_QUESTION, options),

  // File Manager operations
  readDirectory: (dirPath: string) =>
    ipcRenderer.invoke(Events.FILE_READ_DIRECTORY, dirPath),
  createDirectory: (dirPath: string) =>
    ipcRenderer.invoke(Events.FILE_CREATE_DIRECTORY, dirPath),
  createFile: (filePath: string, content?: string) =>
    ipcRenderer.invoke(Events.FILE_CREATE_FILE, filePath, content),
  readFile: (filePath: string, encoding?: BufferEncoding) =>
    ipcRenderer.invoke(Events.FILE_READ, filePath, encoding),
  copy: (sourcePath: string, destinationPath: string) =>
    ipcRenderer.invoke(Events.FILE_COPY, sourcePath, destinationPath),
  move: (sourcePath: string, destinationPath: string) =>
    ipcRenderer.invoke(Events.FILE_MOVE, sourcePath, destinationPath),
  delete: (targetPath: string) =>
    ipcRenderer.invoke(Events.FILE_DELETE, targetPath),
  getInfo: (targetPath: string) =>
    ipcRenderer.invoke(Events.FILE_GET_INFO, targetPath),
  exists: (targetPath: string) =>
    ipcRenderer.invoke(Events.FILE_EXISTS, targetPath),

  startupLoadingProgress: (
    status: ListenerType,
    callback: IpcRendererEventCallback
  ) => handleEvent(status, Events.STARTUP_LOADING_PROGRESS, callback),
  mainWindowReady: () => ipcRenderer.invoke(Events.MAIN_WINDOW_READY),
  getLanguage: () => ipcRenderer.invoke(Events.GET_LANGUAGE),
  checkForUpdates: () => ipcRenderer.invoke(Events.CHECK_FOR_UPDATES),
  downloadUpdate: () => ipcRenderer.invoke(Events.DOWNLOAD_UPDATE),
  installUpdate: () => ipcRenderer.invoke(Events.INSTALL_UPDATE),
  upgradeProgress: (
    status: ListenerType,
    callback: IpcRendererEventCallback
  ) => handleEvent(status, Events.UPGRADE_PROGRESS, callback),
};

contextBridge.exposeInMainWorld('ipcRenderer', api);
