import { ipcRenderer } from 'electron';
import { Events } from '@main/shared/constants';

export const systemApi = {
  // 系统信息
  getSystemInfo: () => ipcRenderer.invoke(Events.SYSTEM_GET_INFO),
  getPlatform: () => ipcRenderer.invoke(Events.SYSTEM_GET_PLATFORM),
  getHomedir: () => ipcRenderer.invoke(Events.SYSTEM_GET_HOMEDIR),
  getVersion: () => ipcRenderer.invoke(Events.SYSTEM_GET_VERSION),

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
    ipcRenderer.on('UPGRADE_ERROR', (_, data) => callback(data));
  },

  // 移除更新进度监听
  removeUpdateProgressListener: () => {
    ipcRenderer.removeAllListeners('UPGRADE_PROGRESS');
  },

  // 移除更新错误监听
  removeUpdateErrorListener: () => {
    ipcRenderer.removeAllListeners('UPGRADE_ERROR');
  },

  // 更新接口
  checkForUpdates: (options?: { serverUrl?: string; autoDownload?: boolean }) => 
    ipcRenderer.invoke(Events.UPDATE_CHECK, options),
  downloadAndInstall: () => 
    ipcRenderer.invoke(Events.UPDATE_DOWNLOAD),
  quitAndInstall: () => ipcRenderer.invoke(Events.UPDATE_QUIT_AND_INSTALL),
  getDownloadsPath: () => ipcRenderer.invoke(Events.UPDATE_GET_DOWNLOADS_PATH),
}; 