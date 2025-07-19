import { ipcMain } from 'electron';
import { Events } from '../../shared/constants';
import { Logger } from '../../core/logger';
import { NetworkService } from './service';

export class NetworkIpcHandler {
  private logger = Logger.create('NetworkIpcHandler');

  constructor(private networkService: NetworkService) {}

  private async handleAsync<T>(operation: () => Promise<T>): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Network operation failed:', error);
      return { success: false, error: errorMessage };
    }
  }

  register(): void {
    // UDP Events
    ipcMain.handle(Events.UDP_CREATE, async (_, port: number, options?: { broadcast?: boolean; multicastAddr?: string }) => {
      return this.handleAsync(() => this.networkService.udp.createAndBind(port, options));
    });

    ipcMain.handle(Events.UDP_DESTROY, async () => {
      return this.handleAsync(() => this.networkService.udp.destroy());
    });

    ipcMain.handle(Events.UDP_STOP, async (_, port: number) => {
      return this.handleAsync(() => Promise.resolve(this.networkService.udp.stop(port)));
    });

    ipcMain.handle(Events.UDP_SEND, async (_, message: string | Buffer, address: string, port: number) => {
      return this.handleAsync(() => this.networkService.udp.send(message, address, port));
    });

    ipcMain.handle(Events.UDP_GET_MESSAGES, async () => {
      return this.handleAsync(() => Promise.resolve(this.networkService.udp.getMessages()));
    });

    ipcMain.handle(Events.UDP_CLEAR_MESSAGES, async () => {
      return this.handleAsync(() => {
        this.networkService.udp.clearMessages();
        return Promise.resolve(true);
      });
    });

    ipcMain.handle(Events.UDP_IS_PORT_RUNNING, async (_, port: number) => {
      return this.handleAsync(() => Promise.resolve(this.networkService.udp.isPortRunning(port)));
    });

    ipcMain.handle(Events.UDP_GET_RUNNING_PORTS, async () => {
      return this.handleAsync(() => Promise.resolve(this.networkService.udp.getRunningPorts()));
    });

    ipcMain.handle(Events.UDP_SET_MAX_MESSAGES, async (_, maxMessages: number) => {
      return this.handleAsync(() => Promise.resolve(this.networkService.udp.setMaxMessages(maxMessages)));
    });

    // WebSocket Events
    ipcMain.handle(Events.WEBSOCKET_CREATE, async (_, port: number, options?: { path?: string }) => {
      return this.handleAsync(() => this.networkService.websocket.createAndBind(port, options));
    });

    ipcMain.handle(Events.WEBSOCKET_DESTROY, async () => {
      return this.handleAsync(() => this.networkService.websocket.destroy());
    });

    ipcMain.handle(Events.WEBSOCKET_STOP, async (_, port: number) => {
      return this.handleAsync(() => Promise.resolve(this.networkService.websocket.stop(port)));
    });

    ipcMain.handle(Events.WEBSOCKET_SEND, async (_, message: string | Buffer, clientId: string, port: number) => {
      return this.handleAsync(() => Promise.resolve(this.networkService.websocket.send(message, clientId, port)));
    });

    ipcMain.handle(Events.WEBSOCKET_SEND_TO_ALL, async (_, message: string | Buffer, port: number) => {
      return this.handleAsync(() => Promise.resolve(this.networkService.websocket.sendToAll(message, port)));
    });

    ipcMain.handle(Events.WEBSOCKET_GET_MESSAGES, async () => {
      return this.handleAsync(() => Promise.resolve(this.networkService.websocket.getMessages()));
    });

    ipcMain.handle(Events.WEBSOCKET_CLEAR_MESSAGES, async () => {
      return this.handleAsync(() => {
        this.networkService.websocket.clearMessages();
        return Promise.resolve(true);
      });
    });

    ipcMain.handle(Events.WEBSOCKET_IS_PORT_RUNNING, async (_, port: number) => {
      return this.handleAsync(() => Promise.resolve(this.networkService.websocket.isPortRunning(port)));
    });

    ipcMain.handle(Events.WEBSOCKET_GET_RUNNING_PORTS, async () => {
      return this.handleAsync(() => Promise.resolve(this.networkService.websocket.getRunningPorts()));
    });

    ipcMain.handle(Events.WEBSOCKET_SET_MAX_MESSAGES, async (_, maxMessages: number) => {
      return this.handleAsync(() => Promise.resolve(this.networkService.websocket.setMaxMessages(maxMessages)));
    });

    this.logger.info('Network IPC handlers registered');
  }

  unregister(): void {
    const events = [
      Events.UDP_CREATE,
      Events.UDP_DESTROY,
      Events.UDP_STOP,
      Events.UDP_SEND,
      Events.UDP_GET_MESSAGES,
      Events.UDP_CLEAR_MESSAGES,
      Events.UDP_IS_PORT_RUNNING,
      Events.UDP_GET_RUNNING_PORTS,
      Events.UDP_SET_MAX_MESSAGES,
      Events.WEBSOCKET_CREATE,
      Events.WEBSOCKET_DESTROY,
      Events.WEBSOCKET_STOP,
      Events.WEBSOCKET_SEND,
      Events.WEBSOCKET_SEND_TO_ALL,
      Events.WEBSOCKET_GET_MESSAGES,
      Events.WEBSOCKET_CLEAR_MESSAGES,
      Events.WEBSOCKET_IS_PORT_RUNNING,
      Events.WEBSOCKET_GET_RUNNING_PORTS,
      Events.WEBSOCKET_SET_MAX_MESSAGES,
    ];

    events.forEach(event => {
      ipcMain.removeHandler(event);
    });

    this.logger.info('Network IPC handlers unregistered');
  }
} 