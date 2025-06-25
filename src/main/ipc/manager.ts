export interface IIpcHandler {
  initIpcHandlers(): void;
  destroyIpcHandlers(): void;
}

export class IpcManager {
  private handlers: IIpcHandler[] = [];

  registerHandler(handler: IIpcHandler): void {
    this.handlers.push(handler);
  }

  registerHandlers(handlers: IIpcHandler[]): void {
    this.handlers.push(...handlers);
  }

  async initializeAll(): Promise<void> {
    try {
      for (const handler of this.handlers) {
        handler.initIpcHandlers();
      }
    } catch (error) {
      console.error('Failed to initialize IPC handlers:', error);
      throw error;
    }
  }

  async destroyAll(): Promise<void> {
    try {
      for (const handler of this.handlers) {
        handler.destroyIpcHandlers();
      }
      this.handlers = [];
    } catch (error) {
      console.error('Failed to destroy IPC handlers:', error);
      throw error;
    }
  }

  getHandlerCount(): number {
    return this.handlers.length;
  }
} 