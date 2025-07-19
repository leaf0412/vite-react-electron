import { autoUpdater, UpdateInfo as ElectronUpdateInfo } from 'electron-updater';
import { BrowserWindow, app } from 'electron';
import { Logger } from '../../core/logger';

export interface UpdateInfo {
  status: boolean;
  needUpdate: boolean;
  version: string;
}

export interface UpdateOptions {
  serverUrl?: string;
  currentVersion: string;
  forceDevUpdateConfig?: boolean;
  autoDownload?: boolean;
  autoInstallOnAppQuit?: boolean;
}

export interface UpdateProgress {
  percent: number;
  transferred: number;
  total: number;
}

export interface UpdateError {
  status: boolean;
  message: string;
  details?: unknown;
}

export interface SystemInfo {
  platform: string;
  homedir: string;
  arch: string;
  nodeVersion: string;
  electronVersion: string;
  chromeVersion: string;
}

type UpgradeProgressType =
  | 'check'
  | 'download'
  | 'downloaded';

export class SystemService {
  private logger = Logger.create('SystemService');
  private updateOptions?: UpdateOptions;
  private mainWindow?: BrowserWindow;
  private updateResponse: UpdateInfo | null = null;
  private isDownloading: boolean = false;

  constructor() {
    this.logger.info('SystemService initialized');
  }

  getSystemInfo(): SystemInfo {
    return {
      platform: process.platform,
      homedir: process.env.HOME || process.env.USERPROFILE || '',
      arch: process.arch,
      nodeVersion: process.version,
      electronVersion: process.versions.electron || 'unknown',
      chromeVersion: process.versions.chrome || 'unknown',
    };
  }

  getAppVersion(): string {
    return app.getVersion();
  }



  initializeUpdater(options: UpdateOptions, mainWindow?: BrowserWindow): void {
    this.updateOptions = options;
    this.mainWindow = mainWindow;
    
    const { serverUrl, forceDevUpdateConfig, autoDownload, autoInstallOnAppQuit } = options;
    
    if (!serverUrl) {
      this.logger.error('更新服务器 URL 是必需的');
      return;
    }

    autoUpdater.setFeedURL({
      provider: 'generic',
      url: serverUrl,
    });
    
    autoUpdater.forceDevUpdateConfig = forceDevUpdateConfig ?? false;
    autoUpdater.autoDownload = autoDownload ?? false;
    autoUpdater.autoInstallOnAppQuit = autoInstallOnAppQuit ?? false;

    this.setupUpdateListeners();
    this.logger.info('自动更新器初始化完成');
  }

  private setupUpdateListeners(): void {
    autoUpdater.on('update-available', (info: ElectronUpdateInfo) => {
      this.updateResponse = {
        status: true,
        needUpdate: true,
        version: info.version,
      };
      this.logger.info(`发现新版本: ${info.version}`);
    });

    autoUpdater.on('update-not-available', (info: ElectronUpdateInfo) => {
      this.logger.info('收到 update-not-available 事件:', info);
      this.updateResponse = {
        status: true,
        needUpdate: false,
        version: info.version,
      };
      this.logger.info('当前版本已是最新');
    });

    autoUpdater.on('download-progress', (progressObj: UpdateProgress) => {
      this.logger.info(`下载进度: ${progressObj.percent}%`);
      this.isDownloading = true;
      this.notifyProgress('download', progressObj);
    });

    autoUpdater.on('update-downloaded', () => {
      this.logger.info('更新下载完成');
      this.isDownloading = false;
      this.notifyProgress('downloaded', {
        percent: 100,
        transferred: 0,
        total: 0,
      });
      
      if (this.updateOptions?.autoInstallOnAppQuit) {
        this.installUpdate();
      }
    });

    autoUpdater.on('error', (error: Error) => {
      this.logger.error('自动更新器错误', error);
      // 只在下载过程中发送错误通知，检查更新的错误通过方法返回值处理
      if (this.isDownloading) {
        this.notifyError('下载过程中发生错误: ' + error.message, error);
      }
    });
  }

  async checkForUpdates(): Promise<UpdateInfo | UpdateError> {
    try {
      if (!this.updateOptions?.serverUrl) {
        return this.createError('更新服务器 URL 未配置');
      }

      this.logger.info('检查更新中...');
      
      // 重置更新响应状态，确保每次检查都是全新的
      this.updateResponse = null;
      
      const result = await autoUpdater.checkForUpdates();

      // 等待一小段时间，让事件监听器有机会执行
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.logger.info('检查更新后的状态:', {
        result: result,
        updateResponse: this.updateResponse
      });

      if (result?.isUpdateAvailable && this.updateResponse) {
        return this.updateResponse;
      }

      // 只有在明确收到事件响应时才返回结果
      if (this.updateResponse) {
        return this.updateResponse;
      }

      // 如果没有收到任何响应事件，说明检查失败
      return this.createError('检查更新失败：未收到服务器响应');
    } catch (error) {
      this.logger.error('checkForUpdates 出现异常:', error);
      return this.createError(error);
    }
  }

  async downloadUpdate(): Promise<UpdateInfo | UpdateError> {
    try {
      if (!this.updateOptions?.serverUrl) {
        const errorMsg = '更新服务器 URL 未配置';
        this.notifyError(errorMsg);
        return this.createError(errorMsg);
      }

      this.logger.info('开始下载更新...');
      this.isDownloading = true;
      this.notifyProgress('download', {
        percent: 0,
        transferred: 0,
        total: 0,
      });
      
      const result = await autoUpdater.downloadUpdate();
      
      return {
        status: true,
        needUpdate: true,
        version: Array.isArray(result) ? result[0] : 'unknown',
      };
    } catch (error) {
      // 重置下载状态
      this.isDownloading = false;
      // 不在这里发送错误通知，因为 autoUpdater.on('error') 已经处理了错误通知
      // 这里只记录日志和返回错误结果
      this.logger.info('downloadUpdate 方法捕获到错误，错误通知已由 autoUpdater error 事件处理');
      return this.createError(error);
    }
  }

  async installUpdate(): Promise<void | UpdateError> {
    try {
      if (!this.updateOptions?.serverUrl) {
        return this.createError('更新服务器 URL 未配置');
      }

      this.logger.info('安装更新并重启应用...');
      autoUpdater.quitAndInstall();
    } catch (error) {
      return this.createError(error);
    }
  }



  private notifyProgress(type: UpgradeProgressType, progress: UpdateProgress): void {
    this.logger.info(`更新进度通知: ${type}, ${progress.percent}%`);
    if (this.mainWindow) {
      this.mainWindow.webContents.send('UPGRADE_PROGRESS', {
        type,
        progress,
      });
      this.logger.info(`已发送进度事件到渲染进程`);
    } else {
      this.logger.warn(`主窗口未设置，无法发送进度通知`);
    }
  }

  private notifyError(message: string, error?: unknown): void {
    this.logger.info(`发送错误通知: ${message}`);
    if (this.mainWindow) {
      this.mainWindow.webContents.send('UPDATE_ERROR', {
        message,
        details: error,
        timestamp: new Date().toISOString(),
      });
      this.logger.info(`已发送错误事件到渲染进程`);
    } else {
      this.logger.warn(`主窗口未设置，无法发送错误通知`);
    }
  }

  private createError(error: unknown): UpdateError {
    const message = error instanceof Error ? error.message : String(error);
    this.logger.error('系统服务错误', message);
    
    return {
      status: false,
      message,
      details: error,
    };
  }

  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }



  destroy(): void {
    autoUpdater.removeAllListeners();
    this.updateResponse = null;
    this.updateOptions = undefined;
    this.mainWindow = undefined;
    this.logger.info('SystemService destroyed');
  }
} 