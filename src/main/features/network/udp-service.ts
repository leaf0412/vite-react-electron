import { createSocket, Socket, RemoteInfo } from 'dgram';
import { Logger } from '../../core/logger';

interface UdpOptions {
  broadcast?: boolean;
  multicastAddr?: string;
}

interface ParsedMessage<T = unknown> {
  raw: Buffer;
  parsed: T;
  rinfo: RemoteInfo;
}

export class UdpService<T = unknown> {
  private sockets: Map<number, Socket> = new Map();
  private isRunning: Map<number, boolean> = new Map();
  private messages: ParsedMessage<T>[] = [];
  private maxMessages: number = 100;
  private messageParser: (buf: Buffer) => T = this.defaultParser;
  private logger = Logger.create('UdpService');

  constructor() {
    this.logger.info('UdpService initialized');
  }

  async createAndBind(port: number, options?: UdpOptions): Promise<boolean> {
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

  stop(port: number): boolean {
    const socket = this.sockets.get(port);
    if (!socket) return false;

    socket.close();
    this.sockets.delete(port);
    this.isRunning.set(port, false);
    this.logger.info(`UDP 服务器停止`, { port });
    return true;
  }

  async destroy(): Promise<void> {
    this.logger.info('销毁所有 UDP 服务器');
    for (const [port, socket] of this.sockets) {
      socket.close();
      this.isRunning.set(port, false);
    }
    this.sockets.clear();
    this.messages = [];
    this.logger.info('所有 UDP 服务器已销毁');
  }

  async send(message: string | Buffer, address: string, port: number): Promise<boolean> {
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

  setMessageParser(parser: (buf: Buffer) => T): void {
    this.messageParser = parser;
  }

  private defaultParser(buf: Buffer): T {
    try {
      return JSON.parse(buf.toString()) as T;
    } catch {
      return buf.toString() as unknown as T;
    }
  }
} 