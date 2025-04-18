import { ipcRenderer } from 'electron';
import { Events } from '@/main/ipc/ipc-events';
import { IpcRendererEventCallback, ListenerType } from '@/types/ipc/events';
import { handleEvent } from '@main/preload/utils';
export const appApi = {
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
