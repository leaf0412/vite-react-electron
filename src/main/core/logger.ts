import log from 'electron-log';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

class Logger {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  static create(context?: string): Logger {
    return new Logger(context);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: unknown, metadata?: Record<string, unknown>): void {
    const fullMessage = metadata ? `${message} ${JSON.stringify(metadata)}` : message;
    this.log('error', fullMessage, error);
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const contextStr = this.context ? `[${this.context}] ` : '';
    const logMessage = `${contextStr}${message}`;

    switch (level) {
      case 'error':
        log.error(logMessage, data);
        break;
      case 'warn':
        log.warn(logMessage, data);
        break;
      case 'info':
        log.info(logMessage, data);
        break;
      case 'debug':
        log.debug(logMessage, data);
        break;
    }
  }
}

export { Logger };
export type { LogLevel };
export const logger = Logger.create('Main'); 