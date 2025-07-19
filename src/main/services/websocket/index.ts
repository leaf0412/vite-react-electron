import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { Logger } from '@main/core/logger';

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

export default class WebSocketManager<T = unknown> {
  private servers: Map<number, WebSocketServer> = new Map();
  private clients: Map<number, Map<string, WebSocket>> = new Map();
  private isRunning: Map<number, boolean> = new Map();
  private messages: ParsedMessage<T>[] = [];
  private maxMessages: number = 100;
  private messageParser: (data: string | Buffer) => T = this.defaultParser;
  private logger = Logger.create('WebSocketManager');
  
  constructor() {}

  public async createAndBind(
    port: number,
    options?: WebSocketOptions
  ): Promise<boolean> {
    this.logger.info(`创建并绑定 WebSocket 服务`, { port, options });
    if (this.servers.has(port)) return false;

    return new Promise(resolve => {
      try {
        const serverOptions = {
          port,
          path: options?.path,
        };

        const server = new WebSocketServer(serverOptions);

        // 初始化客户端Map
        this.clients.set(port, new Map());

        server.on('error', err => {
          this.logger.error(`WebSocket 服务器错误 (port: ${port})`, err);
          resolve(false);
        });

        server.on(
          'connection',
          (socket: WebSocket, request: IncomingMessage) => {
            const clientId = this.generateClientId();
            const clientInfo: ClientInfo = {
              id: clientId,
              ip: request.socket.remoteAddress || '未知',
              remotePort: request.socket.remotePort || 0,
            };

            // 保存客户端连接
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
              if (this.messages.length > this.maxMessages)
                this.messages.shift();
            });

            socket.on('close', () => {
              // 移除客户端连接
              this.clients.get(port)?.delete(clientId);
            });

            socket.on('error', err => {
              this.logger.error(`WebSocket 客户端错误`, err, { clientId, port });
            });
          }
        );

        server.on('listening', () => {
          this.servers.set(port, server);
          this.isRunning.set(port, true);
          this.logger.info(`WebSocket 服务器启动`, { port });
          resolve(true);
        });
      } catch (error) {
        this.logger.error(`创建 WebSocket 服务器失败`, error, { port });
        resolve(false);
      }
    });
  }

  public async destroy(): Promise<void> {
    for (const [port] of this.servers.entries()) {
      await this.stop(port);
    }
    this.servers.clear();
    this.clients.clear();
    this.isRunning.clear();
    this.messages = [];
  }

  public async stop(port: number): Promise<boolean> {
    const server = this.servers.get(port);
    if (!server || !this.isRunning.get(port)) return false;

    return new Promise(resolve => {
      // 关闭所有客户端连接
      const clientsMap = this.clients.get(port);
      if (clientsMap) {
        for (const client of clientsMap.values()) {
          client.terminate();
        }
        clientsMap.clear();
      }

      server.close(() => {
        this.isRunning.set(port, false);
        this.logger.info(`WebSocket 服务器停止`, { port });
        resolve(true);
      });
    });
  }

  public async send(
    message: string | Buffer,
    clientId: string,
    port: number
  ): Promise<boolean> {
    const clientsMap = this.clients.get(port);
    if (!clientsMap || !this.isRunning.get(port)) return false;

    const client = clientsMap.get(clientId);
    if (!client) return false;

    return new Promise(resolve => {
      client.send(message, error => {
        if (error) {
          this.logger.error(`发送消息失败`, error, { clientId, port });
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  public async sendToAll(
    message: string | Buffer,
    port: number
  ): Promise<boolean> {
    const clientsMap = this.clients.get(port);
    if (!clientsMap || !this.isRunning.get(port)) return false;

    const promises: Promise<boolean>[] = [];

    for (const [clientId, client] of clientsMap.entries()) {
      if (client.readyState === WebSocket.OPEN) {
        promises.push(
          new Promise(resolve => {
            client.send(message, error => {
              if (error) {
                this.logger.error(`广播消息失败`, error, { clientId, port });
                resolve(false);
              } else {
                resolve(true);
              }
            });
          })
        );
      }
    }

    const results = await Promise.all(promises);
    return results.some(result => result);
  }

  public setParser(parser: (data: Buffer | string) => T): void {
    this.messageParser = parser;
  }

  private defaultParser(data: Buffer | string): T {
    let text: string;
    if (Buffer.isBuffer(data)) {
      text = data.toString('utf8');
    } else {
      text = data;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  public getMessages(): ParsedMessage<T>[] {
    return this.messages;
  }

  public clearMessages(): void {
    this.messages = [];
  }

  public isPortRunning(port: number): boolean {
    return this.isRunning.get(port) || false;
  }

  public getRunningPorts(): number[] {
    return Array.from(this.isRunning.entries())
      .filter(([, v]) => v)
      .map(([k]) => k);
  }

  public setMaxMessages(maxMessages: number): void {
    this.maxMessages = maxMessages;
  }

  public getConnectedClients(port: number): ClientInfo[] {
    const clientsMap = this.clients.get(port);
    if (!clientsMap) return [];

    const clientInfos: ClientInfo[] = [];
    for (const [clientId] of clientsMap.entries()) {
      const [ip, remotePort] = clientId.split(':');
      clientInfos.push({
        id: clientId,
        ip,
        remotePort: parseInt(remotePort, 10) || 0,
      });
    }

    return clientInfos;
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  public async dispose(): Promise<void> {
    await this.destroy();
  }
}
