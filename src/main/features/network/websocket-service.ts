import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { Logger } from '../../core/logger';

interface WebSocketOptions {
  path?: string;
}

interface ClientInfo {
  id: string;
  ip: string;
  remotePort: number;
}

interface ParsedMessage<T = unknown> {
  raw: string | Buffer;
  parsed: T;
  client: ClientInfo;
  timestamp: number;
}

export class WebSocketService<T = unknown> {
  private servers: Map<number, WebSocketServer> = new Map();
  private clients: Map<number, Map<string, WebSocket>> = new Map();
  private isRunning: Map<number, boolean> = new Map();
  private messages: ParsedMessage<T>[] = [];
  private maxMessages: number = 100;
  private messageParser: (data: string | Buffer) => T = this.defaultParser;
  private logger = Logger.create('WebSocketService');
  
  constructor() {
    this.logger.info('WebSocketService initialized');
  }

  async createAndBind(port: number, options?: WebSocketOptions): Promise<boolean> {
    this.logger.info(`创建并绑定 WebSocket 服务`, { port, options });
    if (this.servers.has(port)) return false;

    return new Promise(resolve => {
      try {
        const serverOptions = {
          port,
          path: options?.path,
        };

        const server = new WebSocketServer(serverOptions);
        this.clients.set(port, new Map());

        server.on('error', err => {
          this.logger.error(`WebSocket 服务器错误 (port: ${port})`, err);
          resolve(false);
        });

        server.on('connection', (socket: WebSocket, request: IncomingMessage) => {
          const clientId = this.generateClientId();
          const clientInfo: ClientInfo = {
            id: clientId,
            ip: request.socket.remoteAddress || '未知',
            remotePort: request.socket.remotePort || 0,
          };

          this.clients.get(port)?.set(clientId, socket);

          socket.on('message', (data: Buffer | string) => {
            const parsed = this.messageParser(data);
            const message: ParsedMessage<T> = {
              raw: data,
              parsed,
              client: clientInfo,
              timestamp: Date.now(),
            };

            this.messages.push(message);
            if (this.messages.length > this.maxMessages) this.messages.shift();
          });

          socket.on('close', () => {
            this.clients.get(port)?.delete(clientId);
          });

          socket.on('error', err => {
            this.logger.error(`WebSocket 客户端错误`, err, { clientId, port });
          });
        });

        server.on('listening', () => {
          this.servers.set(port, server);
          this.isRunning.set(port, true);
          this.logger.info(`WebSocket 服务器启动`, { port });
          resolve(true);
        });

      } catch (error) {
        this.logger.error(`WebSocket 服务器创建失败 (port: ${port})`, error);
        resolve(false);
      }
    });
  }

  stop(port: number): boolean {
    const server = this.servers.get(port);
    if (!server) return false;

    server.close();
    this.servers.delete(port);
    this.clients.delete(port);
    this.isRunning.set(port, false);
    this.logger.info(`WebSocket 服务器停止`, { port });
    return true;
  }

  async destroy(): Promise<void> {
    this.logger.info('销毁所有 WebSocket 服务器');
    for (const [port, server] of this.servers) {
      server.close();
      this.isRunning.set(port, false);
    }
    this.servers.clear();
    this.clients.clear();
    this.messages = [];
    this.logger.info('所有 WebSocket 服务器已销毁');
  }

  send(message: string | Buffer, clientId: string, port: number): boolean {
    const clientMap = this.clients.get(port);
    if (!clientMap) return false;

    const socket = clientMap.get(clientId);
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;

    try {
      socket.send(message);
      return true;
    } catch (error) {
      this.logger.error(`WebSocket 发送消息失败`, error, { clientId, port });
      return false;
    }
  }

  sendToAll(message: string | Buffer, port: number): boolean {
    const clientMap = this.clients.get(port);
    if (!clientMap) return false;

    let successCount = 0;
    for (const [clientId, socket] of clientMap) {
      if (socket.readyState === WebSocket.OPEN) {
        try {
          socket.send(message);
          successCount++;
        } catch (error) {
          this.logger.error(`WebSocket 广播消息失败`, error, { clientId, port });
        }
      }
    }

    this.logger.debug(`WebSocket 广播消息`, { port, successCount, totalClients: clientMap.size });
    return successCount > 0;
  }

  getMessages(): ParsedMessage<T>[] {
    return [...this.messages];
  }

  clearMessages(): void {
    this.messages = [];
  }

  isPortRunning(port: number): boolean {
    return this.isRunning.get(port) ?? false;
  }

  getRunningPorts(): number[] {
    return Array.from(this.isRunning.entries())
      .filter(([, isRunning]) => isRunning)
      .map(([port]) => port);
  }

  setMaxMessages(maxMessages: number): boolean {
    if (maxMessages < 1) return false;
    this.maxMessages = maxMessages;
    if (this.messages.length > maxMessages) {
      this.messages = this.messages.slice(-maxMessages);
    }
    return true;
  }

  setMessageParser(parser: (data: string | Buffer) => T): void {
    this.messageParser = parser;
  }

  private generateClientId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private defaultParser(data: string | Buffer): T {
    try {
      const str = data instanceof Buffer ? data.toString() : String(data);
      return JSON.parse(str) as T;
    } catch {
      return (data instanceof Buffer ? data.toString() : String(data)) as unknown as T;
    }
  }
} 