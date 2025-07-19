import { Logger } from '@main/core/logger';

export interface IIpcHandler {
  initIpcHandlers(): void;
  destroyIpcHandlers(): void;
}

export class IpcManager {
  private handlers: IIpcHandler[] = [];
  private logger = Logger.create('IpcManager');

  registerHandler(handler: IIpcHandler): void {
    this.logger.debug('注册单个 IPC 处理器');
    this.handlers.push(handler);
  }

  registerHandlers(handlers: IIpcHandler[]): void {
    this.logger.info(`注册 ${handlers.length} 个 IPC 处理器`);
    this.handlers.push(...handlers);
  }

  async initializeAll(): Promise<void> {
    try {
      this.logger.info(`初始化 ${this.handlers.length} 个 IPC 处理器`);
      for (const handler of this.handlers) {
        handler.initIpcHandlers();
      }
      this.logger.info('所有 IPC 处理器初始化完成');
    } catch (error) {
      this.logger.error('IPC 处理器初始化失败', error);
      throw error;
    }
  }

  async destroyAll(): Promise<void> {
    try {
      this.logger.info(`销毁 ${this.handlers.length} 个 IPC 处理器`);
      for (const handler of this.handlers) {
        handler.destroyIpcHandlers();
      }
      this.handlers = [];
      this.logger.info('所有 IPC 处理器销毁完成');
    } catch (error) {
      this.logger.error('IPC 处理器销毁失败', error);
      throw error;
    }
  }

  getHandlerCount(): number {
    return this.handlers.length;
  }
} 