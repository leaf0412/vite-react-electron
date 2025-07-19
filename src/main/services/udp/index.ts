import { createSocket, Socket, RemoteInfo } from 'dgram';
import { Logger } from '@main/core/logger';

interface UdpOptions {
  broadcast?: boolean;
  multicastAddr?: string;
}

interface ParsedMessage<T = unknown> {
  raw: Buffer;
  parsed: T;
  rinfo: RemoteInfo;
}

export default class UdpManager<T = unknown> {
  private sockets: Map<number, Socket> = new Map();
  private isRunning: Map<number, boolean> = new Map();
  private messages: ParsedMessage<T>[] = [];
  private maxMessages: number = 100;
  private messageParser: (buf: Buffer) => T = this.defaultParser;
  private logger = Logger.create('UdpManager');

  public async createAndBind(
    port: number,
    options?: UdpOptions
  ): Promise<boolean> {
    if (this.sockets.has(port)) return false;

    const socket = createSocket('udp4');

    return new Promise(resolve => {
      socket.on('error', err => {
        this.logger.error(`UDP 服务器错误 (port: ${port})`, err);
        resolve(false);
      });

      socket.on('message', (msg: Buffer, rinfo: RemoteInfo) => {
        const parsed = this.messageParser(msg);
        this.messages.push({ raw: msg, parsed, rinfo });
        if (this.messages.length > this.maxMessages) this.messages.shift();
      });

      socket.bind(port, () => {
        if (options?.broadcast) {
          socket.setBroadcast(true);
        }

        if (options?.multicastAddr) {
          try {
            socket.addMembership(options.multicastAddr);
          } catch (err) {
            this.logger.warn(`加入组播组失败`, { 
              multicastAddr: options.multicastAddr 
            });
          }
        }

        this.sockets.set(port, socket);
        this.isRunning.set(port, true);
        this.logger.info(`UDP 服务器启动`, { port });
        resolve(true);
      });
    });
  }

  public async destroy(): Promise<void> {
    for (const [port] of this.sockets.entries()) {
      await this.stop(port);
    }
    this.sockets.clear();
    this.isRunning.clear();
    this.messages = [];
  }

  public async stop(port: number): Promise<boolean> {
    const socket = this.sockets.get(port);
    if (!socket || !this.isRunning.get(port)) return false;

    return new Promise(resolve => {
      socket.close(() => {
        this.isRunning.set(port, false);
        this.logger.info(`UDP 服务器停止`, { port });
        resolve(true);
      });
    });
  }

  public async send(
    message: string | Buffer,
    address: string,
    port: number
  ): Promise<boolean> {
    const socket = this.sockets.get(port);
    if (!socket || !this.isRunning.get(port)) return false;

    return new Promise((resolve, reject) => {
      socket.send(message, port, address, error => {
        if (error) {
          this.logger.error(`UDP 发送消息失败 (port: ${port}, address: ${address})`, error);
          reject(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  public setParser(parser: (buf: Buffer) => T): void {
    this.messageParser = parser;
  }

  private defaultParser(buf: Buffer): T {
    const text = buf.toString('utf8');
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

  public async dispose(): Promise<void> {
    await this.destroy();
  }
}
