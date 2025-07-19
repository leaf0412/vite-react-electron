import { ipcMain } from 'electron';
import { Logger } from './logger';

interface IpcHandler {
  register(): void;
  unregister(): void;
}

export class IpcManager {
  private handlers: IpcHandler[] = [];
  private logger = Logger.create('IpcManager');

  registerHandler(handler: IpcHandler): void {
    this.handlers.push(handler);
    handler.register();
    this.logger.info('IPC handler registered');
  }

  registerHandlers(handlers: IpcHandler[]): void {
    handlers.forEach(handler => this.registerHandler(handler));
    this.logger.info(`Registered ${handlers.length} IPC handlers`);
  }

  unregisterAll(): void {
    this.handlers.forEach(handler => {
      try {
        handler.unregister();
      } catch (error) {
        this.logger.error('Failed to unregister IPC handler:', error);
      }
    });
    
    this.handlers = [];
    this.logger.info('All IPC handlers unregistered');
  }

  removeAllListeners(): void {
    ipcMain.removeAllListeners();
    this.logger.info('All IPC listeners removed');
  }

  getHandlerCount(): number {
    return this.handlers.length;
  }
}

export { type IpcHandler }; 