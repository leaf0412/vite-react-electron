import { app, BrowserWindow, ipcMain } from 'electron';
import WindowManager from '@electron/handlers/window-manager';
import {
  registerProtocol,
  unregisterProtocol,
} from '@electron/handlers/create-protocol';
import { isMac } from '@electron/config/constant';
import { Events } from '@electron/config/ipc-events';
import {
  initDialogIpcHandlers,
  destroyDialogIpcHandlers,
} from '@electron/handlers/dialog-manager';
import {
  initFileManagerIpcHandlers,
  destroyFileManagerIpcHandlers,
} from '@electron/handlers/file-manager';
import { UpgradeManager } from '@electron/handlers/upgrade-manager';

let winManager: WindowManager | null = null;
let mainWin: BrowserWindow | undefined = undefined;
let startupWin: BrowserWindow | undefined = undefined;
let loadingComplete = false;
let upgradeManager: UpgradeManager | null = null;

const createStartupWindow = () => {
  startupWin = winManager?.createWindow({
    width: 300,
    height: 10,
    route: '#/startup',
    transparent: true,
    backgroundColor: '#00000000',
    autoHideMenuBar: true,
    resizable: false,
    frame: false,
    show: true,
    alwaysOnTop: true,
  });

  startupWin?.on('closed', () => {
    startupWin = undefined;
  });
};

const createMainWindow = () => {
  mainWin = winManager?.createWindow({
    isMainWin: true,
    show: false,
    width: 1024,
    height: 768,
    minWidth: 1024,
    minHeight: 768,
  });

  if (upgradeManager && mainWin) {
    upgradeManager.setMainWindow(mainWin);
  }

  mainWin?.webContents.on('dom-ready', () => {
    updateStartupProgress(0.2);
  });

  mainWin?.webContents.on('did-frame-finish-load', () => {
    updateStartupProgress(0.6);
  });

  mainWin?.webContents.on('did-finish-load', () => {
    if (mainWin) {
      updateStartupProgress(1);
      loadingComplete = true;
    }
  });

  mainWin?.on('closed', () => {
    mainWin = undefined;
  });
};

function setupIpcHandlers() {
  ipcMain.handle(Events.GET_LANGUAGE, async () => {
    return app.getSystemLocale();
  });

  ipcMain.handle(Events.MAIN_WINDOW_READY, () => {
    if (loadingComplete) {
      mainWin?.show();
      startupWin?.close();
    }
  });
}

function unhandleIpcHandlers() {
  ipcMain.removeHandler(Events.GET_LANGUAGE);
  ipcMain.removeHandler(Events.MAIN_WINDOW_READY);
}

function destroyApp() {
  mainWin?.close();
  startupWin?.close();
  loadingComplete = false;
  unregisterProtocol();
  unhandleIpcHandlers();
  winManager?.destroyIpcHandlers();
  destroyDialogIpcHandlers();
  destroyFileManagerIpcHandlers();
  upgradeManager?.unlisten();
}

const updateStartupProgress = (progress: number) => {
  if (loadingComplete) return;
  startupWin?.webContents.send(Events.STARTUP_LOADING_PROGRESS, progress);
};

async function initApp() {
  await app.whenReady();

  winManager = new WindowManager();
  winManager.initIpcHandlers();
  setupIpcHandlers();
  initDialogIpcHandlers();
  initFileManagerIpcHandlers();
  
  upgradeManager = new UpgradeManager({
    // 填写你的服务器地址
    serverUrl: '',
    currentVersion: app.getVersion(),
    autoInstallOnAppQuit: true,
  });
  upgradeManager.listen();

  createStartupWindow();
  createMainWindow();
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {  
  registerProtocol();
  initApp().catch(console.error);

  app.on('window-all-closed', () => {
    destroyApp();
    if (!isMac) {
      app.quit();
    }
  });

  app.on('second-instance', () => {
    if (mainWin) {
      if (mainWin.isMinimized()) mainWin.restore();
      mainWin.focus();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      initApp().catch(console.error);
    }
  });
}
