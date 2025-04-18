import { BrowserWindow } from 'electron';
import {
  autoUpdater,
  UpdateInfo as ElectronUpdateInfo,
} from 'electron-updater';
import { UpgradeEvents } from '@main/ipc/ipc-events';

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

  private initializeAutoUpdater(): void {
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

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

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

  async installUpdate(): Promise<void | UpdateError> {
    try {
      autoUpdater.quitAndInstall();
    } catch (error) {
      return this.handleError(error);
    }
  }

  private notifyProgress(
    type: UpgradeProgressType,
    progress: UpdateProgress
  ): void {
    if (this.mainWindow) {
      this.mainWindow.webContents.send(UpgradeEvents.UPGRADE_PROGRESS, {
        type,
        progress,
      });
    }
  }

  private handleError(error: unknown): UpdateError {
    return {
      status: false,
      message:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
