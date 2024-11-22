import {
  ipcRenderer,
  contextBridge,
  OpenDialogOptions,
  SaveDialogOptions,
} from 'electron';
import { Events } from '@electron/config/ipc-events';

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
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
  showError: (options: DialogOptions) =>
    ipcRenderer.invoke(Events.DIALOG_ERROR, options),
  showInfo: (options: DialogOptions) =>
    ipcRenderer.invoke(Events.DIALOG_INFO, options),
  showWarning: (options: DialogOptions) =>
    ipcRenderer.invoke(Events.DIALOG_WARNING, options),
  showQuestion: (options: DialogOptions) =>
    ipcRenderer.invoke(Events.DIALOG_QUESTION, options),
});
