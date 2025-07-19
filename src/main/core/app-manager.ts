import { app, BrowserWindow, ipcMain } from 'electron';
import { ServiceContainer } from './service-container';
import type { ServiceRegistry } from './types';
import { IpcManager } from '@main/ipc/manager';
import { Logger } from './logger';
import { WindowManager } from '@main/core';

import { FileService, FileIpcHandler } from '@main/features/file';
import { DialogService, DialogIpcHandler } from '@main/features/dialog';
import { NetworkService, NetworkIpcHandler } from '@main/features/network';
import { SystemService, SystemIpcHandler } from '@main/features/system';
import {
  WindowIpcHandler,
} from '@main/ipc';
import { Events } from '@main/ipc/ipc-events';

import { unregisterProtocol } from '@main/core/protocol';

export class AppManager {
  private serviceContainer = new ServiceContainer();
  private ipcManager = new IpcManager();
  private logger = Logger.create('AppManager');
  private isInitialized = false;
  private mainWindow: BrowserWindow | undefined;
  private startupWindow: BrowserWindow | undefined;
  private loadingComplete = false;
  private fileService = new FileService();
  private fileIpcHandler = new FileIpcHandler(this.fileService);
  private dialogService = new DialogService();
  private dialogIpcHandler = new DialogIpcHandler(this.dialogService);
  private networkService = new NetworkService();
  private networkIpcHandler = new NetworkIpcHandler(this.networkService);
  private systemService = new SystemService();
  private systemIpcHandler = new SystemIpcHandler(this.systemService);

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      throw new Error('AppManager already initialized');
    }

    try {
      this.logger.info('等待应用程序就绪');
      await app.whenReady();
      
      this.logger.info('注册服务');
      this.registerServices();
      
      this.logger.info('注册 IPC 处理器');
      this.registerIpcHandlers();
      
      this.logger.info('初始化 IPC');
      await this.initializeIpc();
      
      this.logger.info('设置应用程序 IPC 处理器');
      this.setupAppIpcHandlers();
      
      this.logger.info('创建窗口');
      await this.createWindows();
      
      this.logger.info('初始化系统服务');
      this.initializeSystemService();
      
      this.isInitialized = true;
      this.logger.info('AppManager 初始化完成');
    } catch (error) {
      this.logger.error('AppManager 初始化失败', error);
      throw error;
    }
  }

  private registerServices(): void {
    this.serviceContainer.register('windowManager', () => new WindowManager());
    this.serviceContainer.register('dialogManager', () => this.dialogService);
    this.serviceContainer.register('fileManager', () => this.fileService);
    this.serviceContainer.register('networkManager', () => this.networkService);
    // 升级管理器已迁移到 SystemService
  }

  private registerIpcHandlers(): void {
    const windowManager = this.serviceContainer.get('windowManager');

    // 注册旧的IPC处理器
    this.ipcManager.registerHandlers([
      new WindowIpcHandler(windowManager),
    ]);
    
    // 注册新的功能模块 IPC 处理器
    this.fileIpcHandler.register();
    this.dialogIpcHandler.register();
    this.networkIpcHandler.register();
    this.systemIpcHandler.register();
  }

  private initializeSystemService(): void {
    this.systemService.initializeUpdater({
      serverUrl: undefined, // 根据需要配置
      currentVersion: app.getVersion(),
      autoInstallOnAppQuit: true,
    }, this.mainWindow);
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

    this.createStartupWindow(windowManager);
    this.createMainWindow(windowManager);
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

  private createMainWindow(windowManager: ServiceRegistry['windowManager']): void {
    this.mainWindow = windowManager.createWindow({
      isMainWin: true,
      show: false,
      width: 1024,
      height: 768,
      minWidth: 1024,
      minHeight: 768,
    });

    if (this.mainWindow) {
      this.systemService.setMainWindow(this.mainWindow);
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
      this.logger.info('开始销毁 AppManager');
      
      this.logger.debug('关闭窗口');
      this.mainWindow?.close();
      this.startupWindow?.close();
      this.loadingComplete = false;
      
      this.logger.debug('移除 IPC 处理器');
      ipcMain.removeHandler(Events.GET_LANGUAGE);
      ipcMain.removeHandler(Events.MAIN_WINDOW_READY);
      
      this.logger.debug('销毁 IPC 管理器');
      // 先销毁新的功能模块 IPC 处理器
      this.fileIpcHandler.unregister();
      this.dialogIpcHandler.unregister();
      this.networkIpcHandler.unregister();
      this.systemIpcHandler.unregister();
      // 再销毁旧的IPC处理器
      await this.ipcManager.destroyAll();
      
      this.logger.debug('销毁网络服务');
      await this.networkService.destroy();
      
      this.logger.debug('销毁系统服务');
      this.systemService.destroy();
      
      this.logger.debug('销毁服务容器');
      await this.serviceContainer.dispose();
      
      this.logger.debug('注销协议');
      unregisterProtocol();
      
      this.isInitialized = false;
      this.logger.info('AppManager 销毁完成');
    } catch (error) {
      this.logger.error('AppManager 销毁失败', error);
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