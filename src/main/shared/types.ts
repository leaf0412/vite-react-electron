export interface IpcResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedTime: Date;
  createdTime: Date;
}

export interface CreateFileOptions {
  content?: string;
  encoding?: BufferEncoding;
  overwrite?: boolean;
}

export interface WindowOptions {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  resizable?: boolean;
  maximizable?: boolean;
  minimizable?: boolean;
  closable?: boolean;
  alwaysOnTop?: boolean;
  skipTaskbar?: boolean;
  show?: boolean;
  modal?: boolean;
  parent?: number;
  route?: string;
  isMainWin?: boolean;
  isMultiWindow?: boolean;
  isDevTools?: boolean;
}

export interface NetworkMessage<T = unknown> {
  raw: Buffer | string;
  parsed: T;
  timestamp: number;
}

export interface UdpMessage<T = unknown> extends NetworkMessage<T> {
  rinfo: {
    address: string;
    family: string;
    port: number;
    size: number;
  };
}

export interface WebSocketMessage<T = unknown> extends NetworkMessage<T> {
  client: {
    id: string;
    ip: string;
    remotePort: number;
  };
}

export interface LoggerConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  enableConsole: boolean;
  enableFile: boolean;
  maxSize: number;
}

export interface AppConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  appVersion: string;
  userDataPath: string;
  logConfig: LoggerConfig;
} 