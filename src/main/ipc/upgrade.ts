import { ipcMain } from 'electron';
import { UpgradeManager } from '@main/core/upgrade-manager';
import { UpgradeEvents } from '@main/ipc/ipc-events';

export default class UpgradeIpcHandler {
  private upgradeManager: UpgradeManager;

  constructor(upgradeManager: UpgradeManager) {
    this.upgradeManager = upgradeManager;
  }

  initIpcHandlers(): void {
    ipcMain.handle(UpgradeEvents.CHECK_FOR_UPDATES, async () => {
      const { serverUrl } = this.upgradeManager['options'];
      if (!serverUrl) {
        return {
          status: false,
          message: 'serverUrl is required',
        };
      }
      return await this.upgradeManager.checkForUpdates();
    });

    ipcMain.handle(UpgradeEvents.DOWNLOAD_UPDATE, async () => {
      const { serverUrl } = this.upgradeManager['options'];
      if (!serverUrl) {
        return {
          status: false,
          message: 'serverUrl is required',
        };
      }
      return await this.upgradeManager.downloadUpdate();
    });

    ipcMain.handle(UpgradeEvents.INSTALL_UPDATE, async () => {
      const { serverUrl } = this.upgradeManager['options'];
      if (!serverUrl) {
        return {
          status: false,
          message: 'serverUrl is required',
        };
      }
      return await this.upgradeManager.installUpdate();
    });
  }

  destroyIpcHandlers(): void {
    Object.keys(UpgradeEvents).forEach(key => {
      ipcMain.removeHandler(UpgradeEvents[key as keyof typeof UpgradeEvents]);
    });
  }
} 