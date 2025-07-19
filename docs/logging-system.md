# 日志系统使用指南

## 概述

项目使用 `electron-log` 作为底层日志库，并封装了自定义的 Logger 类来提供统一的日志管理功能。

## 主要组件

### 1. Logger 类 (`src/main/core/logger.ts`)

提供基础的日志记录功能，支持不同级别的日志输出。

#### 使用方式

```typescript
import { Logger } from '@main/core/logger';

// 创建 Logger 实例
const logger = Logger.createLogger('MyComponent');

// 或者获取全局实例
const globalLogger = Logger.getInstance('Global');

// 记录不同级别的日志
logger.debug('调试信息', { userId: 123 });
logger.info('应用程序启动', { version: '1.0.0' });
logger.warn('配置文件未找到', { path: '/config.json' });
logger.error('数据库连接失败', error, { host: 'localhost' });
```

#### API 方法

- `debug(message: string, metadata?: Record<string, unknown>)`: 调试级别日志
- `info(message: string, metadata?: Record<string, unknown>)`: 信息级别日志  
- `warn(message: string, metadata?: Record<string, unknown>)`: 警告级别日志
- `error(message: string, error?: Error | unknown, metadata?: Record<string, unknown>)`: 错误级别日志
- `createChildLogger(childContext: string)`: 创建子 Logger
- `setLogLevel(level: LogLevel)`: 设置日志级别
- `getLogPath()`: 获取日志文件路径

### 2. LogConfiguration 类 (`src/main/core/log-config.ts`)

提供全局日志配置管理功能。

#### 配置选项

```typescript
interface LogConfig {
  level: 'debug' | 'info' | 'warn' | 'error';  // 日志级别
  maxSize: number;                              // 日志文件最大大小（字节）
  maxFiles: number;                            // 最大日志文件数量
  enableConsole: boolean;                      // 是否启用控制台输出
  enableFile: boolean;                         // 是否启用文件输出
}
```

#### 使用方式

```typescript
import { LogConfiguration } from '@main/core/log-config';

const logConfig = LogConfiguration.getInstance();

// 更新配置
logConfig.updateConfig({
  level: 'warn',
  maxSize: 100 * 1024 * 1024 // 100MB
});

// 设置日志级别
logConfig.setLogLevel('debug');

// 启用/禁用控制台日志
logConfig.enableConsoleLog(false);

// 启用/禁用文件日志
logConfig.enableFileLog(true);

// 获取日志文件路径
const logPath = logConfig.getLogPath();

// 清理日志
logConfig.clearLogs();
```

## 日志级别

- **debug**: 详细的调试信息，仅在开发环境中显示
- **info**: 一般信息，应用程序的正常运行状态
- **warn**: 警告信息，可能的问题但不影响程序运行
- **error**: 错误信息，需要关注的问题

## 日志格式

### 控制台输出格式
```
[2024-12-28 14:30:25.123] [INFO] [ComponentName] 日志消息 {"metadata": "value"}
```

### 文件输出格式
```
[2024-12-28 14:30:25.123] [INFO] [main] [ComponentName] 日志消息 {"metadata": "value"}
```

## 日志文件管理

- **位置**: `{userData}/logs/main.log`
- **归档**: 每日自动归档为 `main_YYYY-MM-DD.log`
- **大小限制**: 默认 50MB，超出后自动归档
- **清理**: 可通过 `LogConfiguration.clearLogs()` 手动清理

## 错误处理

系统会自动捕获以下类型的错误：

1. **未处理的 Promise 拒绝**
2. **未捕获的异常**
3. **应用程序错误**

这些错误会自动记录到日志文件中，有助于问题诊断。

## 最佳实践

### 1. 合理使用日志级别

```typescript
// ✅ 好的做法
logger.debug('用户点击按钮', { buttonId: 'submit' });
logger.info('文件上传完成', { fileName: 'document.pdf', size: 1024 });
logger.warn('API 响应时间较长', { duration: 5000 });
logger.error('文件读取失败', error, { filePath: '/data/file.txt' });

// ❌ 避免的做法
logger.error('用户点击按钮'); // 不应该用 error 记录正常操作
logger.debug('严重的数据库错误'); // 严重错误应该用 error 级别
```

### 2. 提供有用的上下文信息

```typescript
// ✅ 好的做法
logger.error('数据库连接失败', error, {
  host: 'localhost',
  port: 5432,
  database: 'myapp',
  userId: currentUser.id
});

// ❌ 避免的做法
logger.error('连接失败', error);
```

### 3. 不要记录敏感信息

```typescript
// ❌ 避免记录敏感信息
logger.info('用户登录', { password: 'secret123' });

// ✅ 安全的做法
logger.info('用户登录', { userId: user.id, loginTime: new Date() });
```

## 配置示例

### 开发环境配置

```typescript
const logConfig = LogConfiguration.getInstance();
logConfig.updateConfig({
  level: 'debug',
  enableConsole: true,
  enableFile: true,
  maxSize: 10 * 1024 * 1024 // 10MB
});
```

### 生产环境配置

```typescript
const logConfig = LogConfiguration.getInstance();
logConfig.updateConfig({
  level: 'info',
  enableConsole: false,
  enableFile: true,
  maxSize: 100 * 1024 * 1024 // 100MB
});
```

## 故障排除

### 查看日志文件位置

```typescript
import { LogConfiguration } from '@main/core/log-config';

const logConfig = LogConfiguration.getInstance();
console.log('日志文件位置:', logConfig.getLogPath());
```

### 调整日志级别

如果日志太多或太少，可以动态调整：

```typescript
// 显示更多日志
logConfig.setLogLevel('debug');

// 只显示重要日志
logConfig.setLogLevel('error');
```

### 性能考虑

- 在生产环境中避免使用 `debug` 级别
- 合理设置日志文件大小限制
- 定期清理旧的日志文件 