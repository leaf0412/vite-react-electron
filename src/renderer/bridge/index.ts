export * from '@renderer/bridge/window';
export * from '@renderer/bridge/dialog';
export * from '@renderer/bridge/file';
export * from '@renderer/bridge/app';

const ipcRenderer = window.ipcRenderer;

export const platform = ipcRenderer.platform;
export const isLinux = platform === 'linux';
export const isMac = platform === 'darwin';
export const isWin = platform === 'win32';
