export * from './window';
export * from './dialog';
export * from './file';
export * from './app';

const ipcRenderer = window.ipcRenderer;

export const platform = ipcRenderer.platform;
export const isLinux = platform === 'linux';
export const isMac = platform === 'darwin';
export const isWin = platform === 'win32';
