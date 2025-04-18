import { BrowserWindow, ipcMain } from 'electron';
import {
  autoUpdater,
  UpdateInfo as ElectronUpdateInfo,
} from 'electron-updater';
import { Events } from '../ipc/ipc-events';

export interface UpdateInfo {
  status: boolean;
  needUpdate: boolean;
  version: string;
}

export interface UpdateOptions {
  /**
   * 检查更新的服务器地址
   */
  serverUrl?: string;
  /**
   * 当前应用版本
   */
  currentVersion: string;
  /**
   * 是否强制开发更新
   */
  forceDevUpdateConfig?: boolean;
  /**
   * 是否自动下载更新
   */
  autoDownload?: boolean;
  /**
   * 应用退出时自动安装
   */
  autoInstallOnAppQuit?: boolean;
}

export interface UpdateProgress {
  /**
   * 下载进度百分比 (0-100)
   */
  percent: number;
  /**
   * 已下载的字节数
   */
  transferred: number;
  /**
   * 总字节数
   */
  total: number;
}

export interface UpdateError {
  status: boolean;
  message: string;
  details?: unknown;
}

type UpgradeProgressType =
  | 'check'
  | 'available'
  | 'not-available'
  | 'download'
  | 'downloaded';

export class UpgradeManager {
  private options: UpdateOptions;
  private mainWindow: BrowserWindow | null = null;
  private updateResponse: UpdateInfo | null = null;

  constructor(options: UpdateOptions) {
    this.options = options;
    this.initializeAutoUpdater();
  }

  /**
   * 初始化自动更新器
   */
  private initializeAutoUpdater(): void {
    // 配置更新服务器
    const {
      serverUrl,
      forceDevUpdateConfig,
      autoDownload,
      autoInstallOnAppQuit,
    } = this.options;
    if (serverUrl) {
      autoUpdater.setFeedURL({
        provider: 'generic',
        url: serverUrl,
      });
      autoUpdater.forceDevUpdateConfig = forceDevUpdateConfig ?? false;
      autoUpdater.autoDownload = autoDownload ?? false;
      autoUpdater.autoInstallOnAppQuit = autoInstallOnAppQuit ?? false;
    } else {
      console.error('====== update server url is required =======');
    }

    autoUpdater.on('update-available', (info: ElectronUpdateInfo) => {
      this.updateResponse = {
        status: true,
        needUpdate: true,
        version: info.version,
      };
    });

    autoUpdater.on('update-not-available', (info: ElectronUpdateInfo) => {
      this.updateResponse = {
        status: true,
        needUpdate: false,
        version: info.version,
      };
    });

    autoUpdater.on('download-progress', (progressObj: UpdateProgress) => {
      this.notifyProgress('download', progressObj);
    });

    autoUpdater.on('update-downloaded', () => {
      this.notifyProgress('downloaded', {
        percent: 100,
        transferred: 0,
        total: 0,
      });
      if (this.options.autoInstallOnAppQuit) {
        this.installUpdate();
      }
    });

    autoUpdater.on('error', (error: Error) => {
      this.handleError(error);
    });
  }

  /**
   * 设置主窗口，用于显示更新进度
   */
  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  /**
   * listen
   */
  listen(): void {
    ipcMain.handle(Events.CHECK_FOR_UPDATES, async () => {
      const { serverUrl } = this.options;
      if (!serverUrl) {
        return {
          status: false,
          message: 'serverUrl is required',
        };
      }
      return await this.checkForUpdates();
    });

    ipcMain.handle(Events.DOWNLOAD_UPDATE, async () => {
      const { serverUrl } = this.options;
      if (!serverUrl) {
        return {
          status: false,
          message: 'serverUrl is required',
        };
      }
      return await this.downloadUpdate();
    });

    ipcMain.handle(Events.INSTALL_UPDATE, async () => {
      const { serverUrl } = this.options;
      if (!serverUrl) {
        return {
          status: false,
          message: 'serverUrl is required',
        };
      }
      return await this.installUpdate();
    });
  }

  unlisten(): void {
    ipcMain.removeHandler(Events.CHECK_FOR_UPDATES);
    ipcMain.removeHandler(Events.DOWNLOAD_UPDATE);
    ipcMain.removeHandler(Events.INSTALL_UPDATE);
  }

  /**
   * 检查更新
   */
  async checkForUpdates(): Promise<UpdateInfo | UpdateError | null> {
    try {
      const result = await autoUpdater.checkForUpdates();

      if (result?.isUpdateAvailable) {
        return this.updateResponse;
      }
      return {
        status: true,
        needUpdate: false,
        version: '',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * 下载更新
   */
  async downloadUpdate(): Promise<UpdateInfo | UpdateError> {
    try {
      const result = await autoUpdater.downloadUpdate();
      return {
        status: true,
        needUpdate: true,
        version: result[0],
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * 安装更新
   */
  async installUpdate(): Promise<void | UpdateError> {
    try {
      autoUpdater.quitAndInstall();
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * 通知更新进度
   */
  private notifyProgress(
    type: UpgradeProgressType,
    progress: UpdateProgress
  ): void {
    if (this.mainWindow) {
      this.mainWindow.webContents.send(Events.UPGRADE_PROGRESS, {
        type,
        progress,
      });
    }
  }

  /**
   * 处理错误
   */
  private handleError(error: unknown): UpdateError {
    return {
      status: false,
      message:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
