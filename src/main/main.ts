import { app, BrowserWindow } from 'electron';
import { isMac } from '@main/constants';
import { AppManager } from '@main/core';
import { registerProtocol } from '@main/core/protocol';

// 协议注册必须在 app.ready 之前调用
registerProtocol();

let appManager: AppManager | null = null;

async function initApp(): Promise<void> {
  try {
    appManager = new AppManager();
    await appManager.initialize();
  } catch (error) {
    console.error('Failed to initialize app:', error);
    app.quit();
  }
}

async function destroyApp(): Promise<void> {
  try {
    if (appManager) {
      await appManager.destroy();
      appManager = null;
    }
  } catch (error) {
    console.error('Failed to destroy app:', error);
  }
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  initApp().catch(console.error);

  app.on('window-all-closed', async () => {
    await destroyApp();
    if (!isMac) {
      app.quit();
    }
  });

  app.on('before-quit', async (event) => {
    event.preventDefault();
    console.log('App is about to quit, cleaning up resources...');
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
      initApp().catch(console.error);
    }
  });
}
