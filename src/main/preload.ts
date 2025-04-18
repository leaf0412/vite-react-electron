import {
  ipcRenderer,
  contextBridge,
  OpenDialogOptions,
  SaveDialogOptions,
} from 'electron';
import { Events } from '@/main/ipc/ipc-events';
import { IpcRendererEventCallback, ListenerType } from '@/types/ipc/events';
import { WindowInfoParams, WindowOptions } from '@/types/ipc/window';
import { DialogOptions } from '@/types/ipc/dialog';

const handleEvent = (
  status: ListenerType,
  channel: string,
  callback: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void
) => {
  const wrappedCallback = (
    event: Electron.IpcRendererEvent,
    ...args: unknown[]
  ) => callback(event, ...args);
  if (status === 'once') return ipcRenderer.once(channel, wrappedCallback);
  if (status === 'on') return ipcRenderer.on(channel, wrappedCallback);
  if (status === 'off') return ipcRenderer.off(channel, wrappedCallback);
};

const systemApi = {
  platform: process.platform,
  homedir: process.env.HOME || process.env.USERPROFILE || '',
};

const ipcApi = {
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
};

const windowApi = {
  newWindow: (options: WindowOptions) =>
    ipcRenderer.invoke(Events.WINDOW_NEW, options),
  closeWindow: (winId?: number) => ipcRenderer.invoke(Events.WINDOW_CLOSED, winId),
  hideWindow: (winId?: number) => ipcRenderer.invoke(Events.WINDOW_HIDE, winId),
  showWindow: (winId?: number) => ipcRenderer.invoke(Events.WINDOW_SHOW, winId),
  focusWindow: (winId?: number) => ipcRenderer.invoke(Events.WINDOW_FOCUS, winId),
  getWindowInfo: (params?: WindowInfoParams) =>
    ipcRenderer.invoke(Events.GET_WINDOW_INFO, params),
  minimizeWindow: (winId?: number) => ipcRenderer.invoke(Events.WINDOW_MINI, winId),
  maximizeWindow: (winId?: number) => ipcRenderer.invoke(Events.WINDOW_MAX, winId),
  toggleMaximizeWindow: (winId?: number) =>
    ipcRenderer.invoke(Events.WINDOW_MAX_MIN_SIZE, winId),
  restoreWindow: (winId?: number) => ipcRenderer.invoke(Events.WINDOW_RESTORE, winId),
  reloadWindow: (winId?: number) => ipcRenderer.invoke(Events.WINDOW_RELOAD, winId),
  getDisplayInfo: () => ipcRenderer.invoke(Events.SCREEN_GET_DISPLAY_INFO),
};

const dialogApi = {
  openDialog: (options: OpenDialogOptions) =>
    ipcRenderer.invoke(Events.DIALOG_OPEN, options),
  saveDialog: (options: SaveDialogOptions) =>
    ipcRenderer.invoke(Events.DIALOG_SAVE, options),
  showMessageDialog: (options: DialogOptions) =>
    ipcRenderer.invoke(Events.DIALOG_MESSAGE, options),
  showErrorDialog: (options: Omit<DialogOptions, 'type'>) =>
    ipcRenderer.invoke(Events.DIALOG_ERROR, options),
  showInfoDialog: (options: Omit<DialogOptions, 'type'>) =>
    ipcRenderer.invoke(Events.DIALOG_INFO, options),
  showWarningDialog: (options: Omit<DialogOptions, 'type'>) =>
    ipcRenderer.invoke(Events.DIALOG_WARNING, options),
  showQuestionDialog: (options: Omit<DialogOptions, 'type'>) =>
    ipcRenderer.invoke(Events.DIALOG_QUESTION, options),
};

const fileApi = {
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

const appApi = {
  startupLoadingProgress: (
    status: ListenerType,
    callback: IpcRendererEventCallback
  ) => handleEvent(status, Events.STARTUP_LOADING_PROGRESS, callback),
  mainWindowReady: () => ipcRenderer.invoke(Events.MAIN_WINDOW_READY),
  getLanguage: () => ipcRenderer.invoke(Events.GET_LANGUAGE),
  checkForUpdates: () => ipcRenderer.invoke(Events.CHECK_FOR_UPDATES),
  downloadUpdate: () => ipcRenderer.invoke(Events.DOWNLOAD_UPDATE),
  installUpdate: () => ipcRenderer.invoke(Events.INSTALL_UPDATE),
  upgradeProgress: (status: ListenerType, callback: IpcRendererEventCallback) =>
    handleEvent(status, Events.UPGRADE_PROGRESS, callback),
};

contextBridge.exposeInMainWorld('ipcRenderer', {
  ...systemApi,
  ...ipcApi,
  ...windowApi,
  ...dialogApi,
  ...fileApi,
  ...appApi,
});
