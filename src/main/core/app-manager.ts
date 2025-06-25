import { app, BrowserWindow, ipcMain } from 'electron';
import { ServiceContainer } from './service-container';
import type { ServiceRegistry } from './types';
import { IpcManager } from '@main/ipc/manager';
import { WindowManager } from '@main/core';
import { 
  DialogManager, 
  FileManager, 
  UpgradeManager, 
  UdpManager, 
  WebSocketManager 
} from '@main/services';
import {
  WindowIpcHandler,
  DialogIpcHandler,
  FileIpcHandler,
  UpgradeIpcHandler,
  UdpIpcHandler,
  WebSocketIpcHandler,
} from '@main/ipc';
import { Events } from '@main/ipc/ipc-events';
import { VITE_DEV_SERVER_URL } from '@main/constants';
import { unregisterProtocol } from '@main/core/protocol';

export class AppManager {
  private serviceContainer = new ServiceContainer();
  private ipcManager = new IpcManager();
  private isInitialized = false;
  private mainWindow: BrowserWindow | undefined;
  private startupWindow: BrowserWindow | undefined;
  private loadingComplete = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      throw new Error('AppManager already initialized');
    }

    try {
      await app.whenReady();
      
      this.registerServices();
      this.registerIpcHandlers();
      await this.initializeIpc();
      this.setupAppIpcHandlers();
      await this.createWindows();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize app:', error);
      throw error;
    }
  }

  private registerServices(): void {
    this.serviceContainer.register('windowManager', () => new WindowManager());
    this.serviceContainer.register('dialogManager', () => new DialogManager());
    this.serviceContainer.register('fileManager', () => FileManager.getInstance());
    this.serviceContainer.register('upgradeManager', () => new UpgradeManager({
      serverUrl: VITE_DEV_SERVER_URL,
      currentVersion: app.getVersion(),
      autoInstallOnAppQuit: true,
    }));
    this.serviceContainer.register('udpManager', () => new UdpManager());
    this.serviceContainer.register('websocketManager', () => new WebSocketManager());
  }

  private registerIpcHandlers(): void {
    const windowManager = this.serviceContainer.get('windowManager');
    const upgradeManager = this.serviceContainer.get('upgradeManager');
    const udpManager = this.serviceContainer.get('udpManager');
    const websocketManager = this.serviceContainer.get('websocketManager');

    this.ipcManager.registerHandlers([
      new WindowIpcHandler(windowManager),
      new DialogIpcHandler(),
      new FileIpcHandler(),
      new UpgradeIpcHandler(upgradeManager),
      new UdpIpcHandler(udpManager),
      new WebSocketIpcHandler(websocketManager),
    ]);
  }

  private async initializeIpc(): Promise<void> {
    await this.ipcManager.initializeAll();
  }

  private setupAppIpcHandlers(): void {
    ipcMain.handle(Events.GET_LANGUAGE, async () => {
      return app.getSystemLocale();
    });

    ipcMain.handle(Events.MAIN_WINDOW_READY, () => {
      if (this.loadingComplete) {
        this.mainWindow?.show();
        this.startupWindow?.close();
      }
    });
  }

  private async createWindows(): Promise<void> {
    const windowManager = this.serviceContainer.get('windowManager');
    const upgradeManager = this.serviceContainer.get('upgradeManager');

    this.createStartupWindow(windowManager);
    this.createMainWindow(windowManager, upgradeManager);
  }

  private createStartupWindow(windowManager: ServiceRegistry['windowManager']): void {
    this.startupWindow = windowManager.createWindow({
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

    this.startupWindow?.on('closed', () => {
      this.startupWindow = undefined;
    });
  }

  private createMainWindow(windowManager: ServiceRegistry['windowManager'], upgradeManager: ServiceRegistry['upgradeManager']): void {
    this.mainWindow = windowManager.createWindow({
      isMainWin: true,
      show: false,
      width: 1024,
      height: 768,
      minWidth: 1024,
      minHeight: 768,
    });

    if (this.mainWindow) {
      upgradeManager.setMainWindow(this.mainWindow);
    }

    this.mainWindow?.webContents.on('dom-ready', () => {
      this.updateStartupProgress(0.2);
    });

    this.mainWindow?.webContents.on('did-frame-finish-load', () => {
      this.updateStartupProgress(0.6);
    });

    this.mainWindow?.webContents.on('did-finish-load', () => {
      if (this.mainWindow) {
        this.updateStartupProgress(1);
        this.loadingComplete = true;
      }
    });

    this.mainWindow?.on('closed', () => {
      this.mainWindow = undefined;
    });
  }

  private updateStartupProgress(progress: number): void {
    if (this.loadingComplete) return;
    this.startupWindow?.webContents.send(Events.STARTUP_LOADING_PROGRESS, progress);
  }

  async destroy(): Promise<void> {
    try {
      this.mainWindow?.close();
      this.startupWindow?.close();
      this.loadingComplete = false;
      
      ipcMain.removeHandler(Events.GET_LANGUAGE);
      ipcMain.removeHandler(Events.MAIN_WINDOW_READY);
      
      await this.ipcManager.destroyAll();
      await this.serviceContainer.dispose();
      
      unregisterProtocol();
      
      this.isInitialized = false;
    } catch (error) {
      console.error('Failed to destroy app:', error);
      throw error;
    }
  }

  getService<K extends keyof ServiceRegistry>(name: K): ServiceRegistry[K] {
    return this.serviceContainer.get(name);
  }

  isAppInitialized(): boolean {
    return this.isInitialized;
  }
} 