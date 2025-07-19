import { app, BrowserWindow } from 'electron';
import { isMac } from '@main/constants';
import { AppManager } from '@main/core';
import { registerProtocol } from '@main/core/protocol';
import { Logger } from '@main/core/logger';
import { LogConfiguration } from '@main/core/log-config';

// 协议注册必须在 app.ready 之前调用
registerProtocol();

// 初始化日志配置
LogConfiguration.getInstance();

let appManager: AppManager | null = null;
const logger = Logger.create('Main');

async function initApp(): Promise<void> {
  try {
    logger.info('正在初始化应用程序');
    appManager = new AppManager();
    await appManager.initialize();
    logger.info('应用程序初始化完成');
  } catch (error) {
    logger.error('应用程序初始化失败', error);
    app.quit();
  }
}

async function destroyApp(): Promise<void> {
  try {
    if (appManager) {
      logger.info('正在销毁应用程序');
      await appManager.destroy();
      appManager = null;
      logger.info('应用程序销毁完成');
    }
  } catch (error) {
    logger.error('应用程序销毁失败', error);
  }
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  logger.warn('应用程序已在运行，退出当前实例');
  app.quit();
} else {
  initApp().catch(error => logger.error('应用程序启动失败', error));

  app.on('window-all-closed', async () => {
    await destroyApp();
    if (!isMac) {
      app.quit();
    }
  });

  app.on('before-quit', async (event) => {
    event.preventDefault();
    logger.info('应用程序即将退出，正在清理资源...');
    await destroyApp();
    app.exit(0);
  });

  app.on('second-instance', () => {
    const windowManager = appManager?.getService('windowManager');
    if (windowManager?.main) {
      if (windowManager.main.isMinimized()) {
        windowManager.main.restore();
      }
      windowManager.main.focus();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      logger.info('激活应用程序，重新初始化');
      initApp().catch(error => logger.error('重新初始化失败', error));
    }
  });
}
