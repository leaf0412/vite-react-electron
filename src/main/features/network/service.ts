import { Logger } from '../../core/logger';
import { UdpService } from './udp-service';
import { WebSocketService } from './websocket-service';

export class NetworkService {
  private logger = Logger.create('NetworkService');
  public readonly udp: UdpService;
  public readonly websocket: WebSocketService;

  constructor() {
    this.logger.info('NetworkService initialized');
    this.udp = new UdpService();
    this.websocket = new WebSocketService();
  }

  async destroy(): Promise<void> {
    this.logger.info('Destroying NetworkService');
    await Promise.all([
      this.udp.destroy(),
      this.websocket.destroy()
    ]);
    this.logger.info('NetworkService destroyed');
  }
} 