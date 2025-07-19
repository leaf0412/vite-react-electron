export interface SystemInfo {
  platform: string;
  homedir: string;
}

export interface SystemOperations {
  // 系统信息
  getSystemInfo: () => Promise<{ 
    success: boolean; 
    data?: {
      platform: string;
      homedir: string;
      arch: string;
      nodeVersion: string;
      electronVersion: string;
      chromeVersion: string;
    }; 
    error?: string 
  }>;
  getPlatform: () => Promise<{ success: boolean; data?: string; error?: string }>;
  getHomedir: () => Promise<{ success: boolean; data?: string; error?: string }>;
  getVersion: () => Promise<{ success: boolean; data?: string; error?: string }>;

  // 更新功能
  initUpdater: (options: {
    serverUrl?: string;
    currentVersion: string;
    forceDevUpdateConfig?: boolean;
    autoDownload?: boolean;
    autoInstallOnAppQuit?: boolean;
  }) => Promise<{ success: boolean; data?: boolean; error?: string }>;
  
  checkForUpdates: () => Promise<{ 
    success: boolean; 
    data?: {
      status: boolean;
      needUpdate: boolean;
      version: string;
    } | {
      status: boolean;
      message: string;
      details?: unknown;
    }; 
    error?: string 
  }>;
  
  downloadUpdate: () => Promise<{ 
    success: boolean; 
    data?: {
      status: boolean;
      needUpdate: boolean;
      version: string;
    } | {
      status: boolean;
      message: string;
      details?: unknown;
    }; 
    error?: string 
  }>;
  
  installUpdate: () => Promise<{ 
    success: boolean; 
    data?: void | {
      status: boolean;
      message: string;
      details?: unknown;
    }; 
    error?: string 
  }>;
  
  // 监听更新进度
  onUpdateProgress: (callback: (data: {
    type: 'check' | 'download' | 'downloaded';
    progress: {
      percent: number;
      transferred: number;
      total: number;
    };
  }) => void) => void;

  // 监听更新错误
  onUpdateError: (callback: (data: {
    message: string;
    details?: unknown;
    timestamp: string;
  }) => void) => void;

  // 移除更新进度监听
  removeUpdateProgressListener: () => void;

  // 移除更新错误监听
  removeUpdateErrorListener: () => void;
} 