import { app, BrowserWindow } from 'electron';
import { Logger } from './logger';
import { IpcManager } from './ipc-manager';
import { createFileModule } from '../features/file';
import { VITE_DEV_SERVER_URL } from '@main/constants';

export class Application {
  private logger = Logger.create('Application');
  private ipcManager = new IpcManager();
  private mainWindow: BrowserWindow | null = null;

  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing application...');
      
      await app.whenReady();
      
      // 注册模块
      await this.registerModules();
      
      // 创建主窗口
      this.createMainWindow();
      
      this.logger.info('Application initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize application:', error);
      throw error;
    }
  }

  private async registerModules(): Promise<void> {
    // 注册文件模块
    const fileModule = createFileModule();
    this.ipcManager.registerHandler(fileModule.ipcHandler);
    
    this.logger.info('All modules registered');
  }

  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: require.resolve('../preload/preload.js'),
      },
    });

    // 加载页面
    if (VITE_DEV_SERVER_URL) {
      this.mainWindow.loadURL(VITE_DEV_SERVER_URL);
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile('dist/index.html');
    }

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    this.logger.info('Main window created');
  }

  async shutdown(): Promise<void> {
    try {
      this.logger.info('Shutting down application...');
      
      // 注销所有 IPC 处理器
      this.ipcManager.unregisterAll();
      
      // 关闭所有窗口
      BrowserWindow.getAllWindows().forEach(window => window.close());
      
      this.logger.info('Application shutdown complete');
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
    }
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }
} 