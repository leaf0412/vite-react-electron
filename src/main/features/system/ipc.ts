import { ipcMain, BrowserWindow } from 'electron';
import { Logger } from '../../core/logger';
import { Events } from '../../shared/constants';
import { SystemService } from './service';

interface IpcHandler {
  register(): void;
  unregister(): void;
}

export class SystemIpcHandler implements IpcHandler {
  private logger = Logger.create('SystemIpcHandler');

  constructor(private systemService: SystemService) {}

  register(): void {
    // 系统信息相关
    ipcMain.handle(Events.SYSTEM_GET_INFO, async () => {
      return this.handleAsync(() => Promise.resolve(this.systemService.getSystemInfo()));
    });

    ipcMain.handle(Events.SYSTEM_GET_PLATFORM, async () => {
      return this.handleAsync(() => Promise.resolve(process.platform));
    });

    ipcMain.handle(Events.SYSTEM_GET_HOMEDIR, async () => {
      return this.handleAsync(() => Promise.resolve(process.env.HOME || process.env.USERPROFILE || ''));
    });

    ipcMain.handle(Events.SYSTEM_GET_VERSION, async () => {
      return this.handleAsync(() => Promise.resolve(this.systemService.getAppVersion()));
    });

    // 更新相关
    ipcMain.handle(Events.UPDATE_CHECK, async (event, options?: { serverUrl?: string; autoDownload?: boolean }) => {
      const mainWindow = BrowserWindow.fromWebContents(event.sender);
      if (mainWindow) {
        this.systemService.setMainWindow(mainWindow);
      }
      return this.systemService.checkForUpdates(options);
    });

    ipcMain.handle(Events.UPDATE_DOWNLOAD, async () => {
      return this.systemService.downloadAndInstall();
    });

    ipcMain.handle(Events.UPDATE_QUIT_AND_INSTALL, async () => {
      return this.systemService.quitAndInstall();
    });

    ipcMain.handle(Events.UPDATE_GET_DOWNLOADS_PATH, async () => {
      return this.handleAsync(() => this.systemService.getDownloadsPath());
    });

    this.logger.info('System IPC handlers registered');
  }

  unregister(): void {
    ipcMain.removeHandler(Events.SYSTEM_GET_INFO);
    ipcMain.removeHandler(Events.SYSTEM_GET_PLATFORM);
    ipcMain.removeHandler(Events.SYSTEM_GET_HOMEDIR);
    ipcMain.removeHandler(Events.SYSTEM_GET_VERSION);
    ipcMain.removeHandler(Events.UPDATE_CHECK);
    ipcMain.removeHandler(Events.UPDATE_DOWNLOAD);
    ipcMain.removeHandler(Events.UPDATE_QUIT_AND_INSTALL);
    ipcMain.removeHandler(Events.UPDATE_GET_DOWNLOADS_PATH);
    
    this.logger.info('System IPC handlers unregistered');
  }

  private async handleAsync<T>(fn: () => Promise<T>): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const data = await fn();
      
      // 检查是否为错误对象（包含 status: false 的对象）
      if (data && typeof data === 'object' && 'status' in data && data.status === false) {
        const errorData = data as unknown as { status: false; message: string };
        this.logger.error('Service method returned error:', errorData.message);
        return { success: false, error: errorData.message };
      }
      
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('IPC handler error:', message);
      return { success: false, error: message };
    }
  }
} 