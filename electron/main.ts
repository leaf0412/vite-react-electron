import { app, BrowserWindow } from 'electron';
import WindowManager from './handlers/window-manager';
import { registerProtocol, unProtocol } from './handlers/create-protocol';
import { isMac } from './config/constant';

let winManager: WindowManager | null = null;
let win: BrowserWindow | null = null;

async function initApp() {
  await app.whenReady();

  winManager = new WindowManager();
  winManager.initIpcHandlers();

  win = winManager.createWindow({
    show: false,
    width: 768,
    height: 1024,
    minHeight: 768,
    minWidth: 1024,
  });

  win.on('ready-to-show', () => {
    win?.show();
  });
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  registerProtocol();

  initApp().catch(console.error);

  app.on('window-all-closed', () => {
    win = null;
    unProtocol();
    winManager?.destroyIpcHandlers();
    if (!isMac) {
      app.quit();
    }
  });

  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      initApp().catch(console.error);
    } else {
      BrowserWindow.getAllWindows()[0].focus();
    }
  });
}
