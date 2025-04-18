import { IpcRendererEventCallback, ListenerType } from '@/types/ipc/events';
const ipcRenderer = window.ipcRenderer;

export const startupLoadingProgress = (
  status: ListenerType,
  callback: IpcRendererEventCallback
) => {
  return ipcRenderer.startupLoadingProgress(status, callback);
};

export const mainWindowReady = () => {
  return ipcRenderer.mainWindowReady();
};

export const getLanguage = () => {
  return ipcRenderer.getLanguage();
};

export const checkForUpdates = () => {
  return ipcRenderer.checkForUpdates();
};

export const downloadUpdate = () => {
  return ipcRenderer.downloadUpdate();
};

export const installUpdate = () => {
  return ipcRenderer.installUpdate();
};

export const upgradeProgress = (
  status: ListenerType,
  callback: IpcRendererEventCallback
) => {
  return ipcRenderer.upgradeProgress(status, callback);
};
