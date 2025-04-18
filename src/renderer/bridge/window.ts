import { WindowInfoParams, WindowOptions } from '@/types/ipc/window';

const ipcRenderer = window.ipcRenderer;

export const createWindow = (options: WindowOptions) => {
  return ipcRenderer.newWindow(options);
};

export const closeWindow = (winId?: number) => {
  return ipcRenderer.closeWindow(winId);
};

export const hideWindow = (winId?: number) => {
  return ipcRenderer.hideWindow(winId);
};

export const showWindow = (winId?: number) => {
  return ipcRenderer.showWindow(winId);
};

export const focusWindow = (winId?: number) => {
  return ipcRenderer.focusWindow(winId);
};

export const getWindowInfo = (params?: WindowInfoParams) => {
  return ipcRenderer.getWindowInfo(params);
};

export const minimizeWindow = (winId?: number) => {
  return ipcRenderer.minimizeWindow(winId);
};

export const maximizeWindow = (winId?: number) => {
  return ipcRenderer.maximizeWindow(winId);
};

export const toggleMaximizeWindow = (winId?: number) => {
  return ipcRenderer.toggleMaximizeWindow(winId);
};

export const restoreWindow = (winId?: number) => {
  return ipcRenderer.restoreWindow(winId);
};

export const reloadWindow = (winId?: number) => {
  return ipcRenderer.reloadWindow(winId);
};

export const getDisplayInfo = () => {
  return ipcRenderer.getDisplayInfo();
};
