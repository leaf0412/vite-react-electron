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

  // 更新接口
  checkForUpdates: (options?: { serverUrl?: string; autoDownload?: boolean }) => Promise<{ 
    success: boolean; 
    data?: {
      hasUpdate: boolean;
      version?: string;
      downloadUrl?: string;
      fileName?: string;
      fileSize?: number;
      md5?: string;
      publishedAt?: string;
      updateMethod: 'manual';
    }; 
    error?: string 
  }>;

  downloadAndInstall: () => Promise<{ 
    success: boolean; 
    data?: { 
      filePath?: string;
      updateMethod: 'manual';
    }; 
    error?: string 
  }>;

  quitAndInstall: () => Promise<{ success: boolean; error?: string }>;
  
  getDownloadsPath: () => Promise<{ success: boolean; data?: string; error?: string }>;
} 