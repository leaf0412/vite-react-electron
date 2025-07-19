import { ipcRenderer } from 'electron';
import { Events } from '@main/shared/constants';

export const systemApi = {
  // 系统信息
  getSystemInfo: () => ipcRenderer.invoke(Events.SYSTEM_GET_INFO),
  getPlatform: () => ipcRenderer.invoke(Events.SYSTEM_GET_PLATFORM),
  getHomedir: () => ipcRenderer.invoke(Events.SYSTEM_GET_HOMEDIR),
  getVersion: () => ipcRenderer.invoke(Events.SYSTEM_GET_VERSION),

  // 更新功能
  initUpdater: (options: {
    serverUrl?: string;
    currentVersion: string;
    forceDevUpdateConfig?: boolean;
    autoDownload?: boolean;
    autoInstallOnAppQuit?: boolean;
  }) => ipcRenderer.invoke(Events.SYSTEM_INIT_UPDATER, options),
  
  checkForUpdates: () => ipcRenderer.invoke(Events.UPDATE_CHECK),
  downloadUpdate: () => ipcRenderer.invoke(Events.UPDATE_DOWNLOAD),
  installUpdate: () => ipcRenderer.invoke(Events.UPDATE_INSTALL),

  // 监听更新进度
  onUpdateProgress: (callback: (data: {
    type: 'check' | 'download' | 'downloaded';
    progress: {
      percent: number;
      transferred: number;
      total: number;
    };
  }) => void) => {
    ipcRenderer.on('UPGRADE_PROGRESS', (_, data) => callback(data));
  },

  // 监听更新错误
  onUpdateError: (callback: (data: {
    message: string;
    details?: unknown;
    timestamp: string;
  }) => void) => {
    ipcRenderer.on('UPDATE_ERROR', (_, data) => callback(data));
  },

  // 移除更新进度监听
  removeUpdateProgressListener: () => {
    ipcRenderer.removeAllListeners('UPGRADE_PROGRESS');
  },

  // 移除更新错误监听
  removeUpdateErrorListener: () => {
    ipcRenderer.removeAllListeners('UPDATE_ERROR');
  },
}; 