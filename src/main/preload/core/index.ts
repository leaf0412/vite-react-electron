export * from '@main/preload/core/app';
export * from '@main/preload/core/dialog';
export * from '@main/preload/core/file';
export * from '@main/preload/core/window';

const ipcRenderer = window.ipcRenderer;
export const platform = ipcRenderer.platform;