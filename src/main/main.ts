import { app, BrowserWindow, ipcMain } from 'electron';
import { isMac, VITE_DEV_SERVER_URL } from '@main/constants';
import { Events } from '@main/ipc/ipc-events';
import { registerProtocol, unregisterProtocol } from '@main/core/protocol';
import { UpgradeManager, WindowManager } from '@main/core';
import {
  WindowIpcHandler,
  DialogIpcHandler,
  FileIpcHandler,
  UpgradeIpcHandler,
  UdpIpcHandler,
  WebSocketIpcHandler,
} from '@main/ipc';

let winManager: WindowManager | null = null;
let windowIpcHandler: WindowIpcHandler | null = null;
let mainWin: BrowserWindow | undefined = undefined;
let startupWin: BrowserWindow | undefined = undefined;
let loadingComplete = false;
let upgradeManager: UpgradeManager | null = null;
let upgradeIpcHandler: UpgradeIpcHandler | null = null;
let dialogIpcHandler: DialogIpcHandler | null = null;
let fileIpcHandler: FileIpcHandler | null = null;
let udpIpcHandler: UdpIpcHandler | null = null;
let webSocketIpcHandler: WebSocketIpcHandler | null = null;

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
  windowIpcHandler?.destroyIpcHandlers();
  windowIpcHandler = null;
  upgradeIpcHandler?.destroyIpcHandlers();
  upgradeIpcHandler = null;
  dialogIpcHandler?.destroyIpcHandlers();
  dialogIpcHandler = null;
  fileIpcHandler?.destroyIpcHandlers();
  fileIpcHandler = null;
  udpIpcHandler?.destroyIpcHandlers();
  udpIpcHandler = null;
  webSocketIpcHandler?.destroyIpcHandlers();
  webSocketIpcHandler = null;
}

const updateStartupProgress = (progress: number) => {
  if (loadingComplete) return;
  startupWin?.webContents.send(Events.STARTUP_LOADING_PROGRESS, progress);
};

async function initApp() {
  await app.whenReady();

  winManager = new WindowManager();
  windowIpcHandler = new WindowIpcHandler(winManager);
  windowIpcHandler.initIpcHandlers();
  setupIpcHandlers();
  dialogIpcHandler = new DialogIpcHandler();
  dialogIpcHandler.initIpcHandlers();
  fileIpcHandler = new FileIpcHandler();
  fileIpcHandler.initIpcHandlers();
  upgradeManager = new UpgradeManager({
    serverUrl: VITE_DEV_SERVER_URL,
    currentVersion: app.getVersion(),
    autoInstallOnAppQuit: true,
  });
  upgradeIpcHandler = new UpgradeIpcHandler(upgradeManager);
  upgradeIpcHandler.initIpcHandlers();
  udpIpcHandler = new UdpIpcHandler();
  udpIpcHandler.initIpcHandlers();
  webSocketIpcHandler = new WebSocketIpcHandler();
  webSocketIpcHandler.initIpcHandlers();

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
