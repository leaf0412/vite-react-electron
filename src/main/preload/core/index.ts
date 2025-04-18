export * from './app';
export * from './dialog';
export * from './file';
export * from './window';

const ipcRenderer = window.ipcRenderer;
export const platform = ipcRenderer.platform;