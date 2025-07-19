import { ipcRenderer } from 'electron';
import { Events } from '@main/ipc/ipc-events';
import { IpcRendererEventCallback, ListenerType } from '@/types/ipc/events';
import { handleEvent } from '@preload/utils';

export const appApi = {
  startupLoadingProgress: (
    status: ListenerType,
    callback: IpcRendererEventCallback
  ) => handleEvent(status, Events.STARTUP_LOADING_PROGRESS, callback),
  mainWindowReady: () => ipcRenderer.invoke(Events.MAIN_WINDOW_READY),
  getLanguage: () => ipcRenderer.invoke(Events.GET_LANGUAGE),
};
