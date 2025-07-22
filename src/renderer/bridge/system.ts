export const systemBridge = {
  // 系统信息
  getSystemInfo: () => window.ipcRenderer.getSystemInfo(),
  getPlatform: () => window.ipcRenderer.getPlatform(),
  getHomedir: () => window.ipcRenderer.getHomedir(),
  getVersion: () => window.ipcRenderer.getVersion(),

  // 监听更新进度
  onUpdateProgress: (callback: (data: {
    type: 'check' | 'download' | 'downloaded';
    progress: {
      percent: number;
      transferred: number;
      total: number;
    };
  }) => void) => window.ipcRenderer.onUpdateProgress(callback),

  // 监听更新错误
  onUpdateError: (callback: (data: {
    message: string;
    details?: unknown;
    timestamp: string;
  }) => void) => window.ipcRenderer.onUpdateError(callback),

  // 移除更新进度监听
  removeUpdateProgressListener: () => window.ipcRenderer.removeUpdateProgressListener(),

  // 移除更新错误监听
  removeUpdateErrorListener: () => window.ipcRenderer.removeUpdateErrorListener(),

  // 更新接口
  checkForUpdates: (options?: { serverUrl?: string; autoDownload?: boolean }) => 
    window.ipcRenderer.checkForUpdates(options),
  downloadAndInstall: () => 
    window.ipcRenderer.downloadAndInstall(),
  quitAndInstall: () => window.ipcRenderer.quitAndInstall(),
  getDownloadsPath: () => window.ipcRenderer.getDownloadsPath(),

  // 基本系统信息
  get platform() {
    return window.ipcRenderer.platform;
  },

  get homedir() {
    return window.ipcRenderer.homedir;
  },
}; 