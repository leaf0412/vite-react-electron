import log from 'electron-log';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

export interface LogConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  maxSize: number;
  maxFiles: number;
  enableConsole: boolean;
  enableFile: boolean;
}

export class LogConfiguration {
  private static instance: LogConfiguration;
  private config: LogConfig;

  private constructor() {
    this.config = {
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
      maxSize: 50 * 1024 * 1024,
      maxFiles: 10,
      enableConsole: true,
      enableFile: true,
    };
    this.setupElectronLog();
  }

  static getInstance(): LogConfiguration {
    if (!LogConfiguration.instance) {
      LogConfiguration.instance = new LogConfiguration();
    }
    return LogConfiguration.instance;
  }

  private setupElectronLog(): void {
    const isDev = process.env.NODE_ENV === 'development';

    if (this.config.enableConsole) {
      log.transports.console.level = this.config.level;
      log.transports.console.format = isDev 
        ? '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}'
        : '[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}';
    } else {
      log.transports.console.level = false;
    }

    if (this.config.enableFile) {
      log.transports.file.level = this.config.level;
      log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] [{processType}] {text}';

      const userDataPath = app.getPath('userData');
      log.transports.file.resolvePathFn = (variables) => {
        if (isDev) {
          // 开发环境，日志文件放在项目根目录
          return path.join(process.cwd(), 'logs', variables.fileName || 'main.log');
        }
        return path.join(userDataPath, 'logs', variables.fileName || 'main.log');
      };

      // 设置日志文件轮转
      log.transports.file.fileName = 'main.log';
      log.transports.file.maxSize = this.config.maxSize;
    } else {
      log.transports.file.level = false;
    }

    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    log.errorHandler.startCatching({
      showDialog: false,
      onError: (error) => {
        log.error('未处理的错误', error);
      }
    });

    process.on('unhandledRejection', (reason, promise) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      log.error('未处理的 Promise 拒绝', error, {
        promise: promise.toString(),
        reason: String(reason)
      });
    });

    process.on('uncaughtException', (error) => {
      log.error('未捕获的异常', error);
    });
  }

  updateConfig(newConfig: Partial<LogConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.setupElectronLog();
  }

  getConfig(): LogConfig {
    return { ...this.config };
  }

  getLogPath(): string {
    return log.transports.file.getFile().path;
  }

  clearLogs(): void {
    const logPath = this.getLogPath();
    try {
      fs.writeFileSync(logPath, '');
    } catch (error) {
      log.error('清理日志文件失败', error);
    }
  }

  setLogLevel(level: LogConfig['level']): void {
    this.updateConfig({ level });
  }

  enableConsoleLog(enable: boolean): void {
    this.updateConfig({ enableConsole: enable });
  }

  enableFileLog(enable: boolean): void {
    this.updateConfig({ enableFile: enable });
  }
} 