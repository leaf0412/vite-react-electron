type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
}

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
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.context,
      data,
    };

    const contextStr = this.context ? `[${this.context}] ` : '';
    const logMessage = `[${level.toUpperCase()}] ${entry.timestamp} ${contextStr}${message}`;

    switch (level) {
      case 'error':
        console.error(logMessage, data);
        break;
      case 'warn':
        console.warn(logMessage, data);
        break;
      case 'info':
        console.log(logMessage, data);
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(logMessage, data);
        }
        break;
    }
  }
}

export { Logger };
export const logger = Logger.create('Main'); 