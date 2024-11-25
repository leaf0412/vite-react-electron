# Electron Dialog 开发指南

## 一、Electron 原生对话框

### 1.1 什么是 Electron Dialog?

Electron Dialog 是 Electron 提供的原生对话框 API,它允许应用程序显示系统原生的对话框用于:
- 打开文件/文件夹
- 保存文件
- 显示消息提示
- 显示错误警告
- 进行用户确认

这些对话框完全遵循操作系统的原生外观和行为,给用户带来熟悉的体验。

### 1.2 基本使用方法

#### 1.2.1 文件选择对话框

```typescript
// 在主进程中
import { dialog } from 'electron';

// 打开文件对话框
async function openFile() {
  const result = await dialog.showOpenDialog({
    title: '选择文件',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: '图片', extensions: ['jpg', 'png'] }
    ]
  });

  if (!result.canceled) {
    console.log('选择的文件:', result.filePaths);
  }
}

// 打开文件夹对话框
async function openDirectory() {
  const result = await dialog.showOpenDialog({
    title: '选择文件夹',
    properties: ['openDirectory']
  });

  if (!result.canceled) {
    console.log('选择的文件夹:', result.filePaths[0]);
  }
}
```

#### 1.2.2 保存文件对话框

```typescript
async function saveFile() {
  const result = await dialog.showSaveDialog({
    title: '保存文件',
    defaultPath: 'untitled.txt',
    filters: [
      { name: '文本文件', extensions: ['txt'] },
      { name: '所有文件', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePath) {
    console.log('保存路径:', result.filePath);
  }
}
```

#### 1.2.3 消息对话框

```typescript
// 信息提示
async function showInfo() {
  const result = await dialog.showMessageBox({
    type: 'info',
    title: '提示',
    message: '操作已完成',
    buttons: ['确定']
  });
}

// 错误提示
async function showError() {
  const result = await dialog.showMessageBox({
    type: 'error',
    title: '错误',
    message: '操作失败',
    detail: '请检查网络连接',
    buttons: ['重试', '取消']
  });
}

// 确认对话框
async function showConfirm() {
  const result = await dialog.showMessageBox({
    type: 'question',
    title: '确认',
    message: '是否删除?',
    detail: '此操作无法撤销',
    buttons: ['确定', '取消'],
    defaultId: 1,
    cancelId: 1
  });

  return result.response === 0;
}
```

### 1.3 对话框选项说明

#### 1.3.1 通用选项
```typescript
interface CommonOptions {
  title?: string;          // 对话框标题
  defaultPath?: string;    // 默认路径
  buttonLabel?: string;    // 确认按钮文字
}
```

#### 1.3.2 文件选择对话框选项
```typescript
interface OpenDialogOptions {
  properties?: Array<
    | 'openFile'          // 选择文件
    | 'openDirectory'     // 选择目录
    | 'multiSelections'   // 允许多选
    | 'showHiddenFiles'   // 显示隐藏文件
    | 'createDirectory'   // 允许创建目录
    | 'promptToCreate'    // 提示创建不存在的文件
  >;
  filters?: Array<{
    name: string;         // 过滤器名称
    extensions: string[]; // 文件扩展名列表
  }>;
}
```

#### 1.3.3 消息对话框选项
```typescript
interface MessageBoxOptions {
  type?: 'none' | 'info' | 'error' | 'question' | 'warning';
  buttons?: string[];     // 按钮文字数组
  defaultId?: number;     // 默认选中的按钮
  cancelId?: number;      // 取消按钮的索引
  message: string;        // 主要信息
  detail?: string;        // 详细信息
  checkboxLabel?: string; // 复选框文字
  checkboxChecked?: boolean; // 复选框是否选中
}
```

### 1.4 使用限制与注意事项

1. **进程限制**
   - dialog API 只能在主进程中使用
   - 渲染进程需要通过 IPC 通信调用

2. **阻塞性**
   - 对话框是模态的,会阻塞进程直到用户响应
   - 避免在关键操作中频繁使用

3. **平台差异**
   - 不同操作系统的对话框外观和行为可能有差异
   - 某些选项在特定平台可能不支持

## 二、DialogManager 实现详解

### 2.1 为什么需要 DialogManager?

原生 Dialog API 存在以下问题:
1. 只能在主进程使用,需要手动处理 IPC 通信
2. 缺乏统一的错误处理机制
3. 代码组织分散,难以维护
4. 类型提示不完善

DialogManager 通过封装提供:
- 统一的接口
- 完整的类型支持
- 自动的 IPC 通信
- 标准的错误处理

### 2.2 核心实现

#### 2.2.1 IPC 事件定义
```typescript
// src/constants/ipc-events.ts
export const DialogEvents = {
  DIALOG_OPEN: 'dialog:open',
  DIALOG_SAVE: 'dialog:save',
  DIALOG_MESSAGE: 'dialog:message',
  DIALOG_ERROR: 'dialog:error',
  DIALOG_INFO: 'dialog:info',
  DIALOG_WARNING: 'dialog:warning',
  DIALOG_QUESTION: 'dialog:question'
} as const;

export type DialogEventType = typeof DialogEvents[keyof typeof DialogEvents];
```

#### 2.2.2 主进程处理器
```typescript
// src/main/dialog/handler.ts
import { dialog, ipcMain } from 'electron';
import { DialogEvents } from '@/constants/ipc-events';

export class DialogHandler {
  static init() {
    this.initOpenDialog();
    this.initSaveDialog();
    this.initMessageDialog();
    this.initTypedMessageDialogs();
  }

  private static initOpenDialog() {
    ipcMain.handle(DialogEvents.DIALOG_OPEN, async (_event, options) => {
      try {
        return await dialog.showOpenDialog(options);
      } catch (error) {
        console.error('Open dialog error:', error);
        throw error;
      }
    });
  }

  private static initSaveDialog() {
    ipcMain.handle(DialogEvents.DIALOG_SAVE, async (_event, options) => {
      try {
        return await dialog.showSaveDialog(options);
      } catch (error) {
        console.error('Save dialog error:', error);
        throw error;
      }
    });
  }

  private static initMessageDialog() {
    ipcMain.handle(DialogEvents.DIALOG_MESSAGE, async (_event, options) => {
      try {
        return await dialog.showMessageBox(options);
      } catch (error) {
        console.error('Message dialog error:', error);
        throw error;
      }
    });
  }

  private static initTypedMessageDialogs() {
    const typeHandlers = [
      { event: DialogEvents.DIALOG_ERROR, type: 'error' },
      { event: DialogEvents.DIALOG_INFO, type: 'info' },
      { event: DialogEvents.DIALOG_WARNING, type: 'warning' },
      { event: DialogEvents.DIALOG_QUESTION, type: 'question' }
    ];

    typeHandlers.forEach(({ event, type }) => {
      ipcMain.handle(event, async (_event, options) => {
        try {
          return await dialog.showMessageBox({ ...options, type });
        } catch (error) {
          console.error(`${type} dialog error:`, error);
          throw error;
        }
      });
    });
  }

  static destroy() {
    Object.values(DialogEvents).forEach(event => {
      ipcMain.removeHandler(event);
    });
  }
}
```

#### 2.2.3 渲染进程接口
```typescript
// src/renderer/dialog/types.ts
import type {
  OpenDialogOptions,
  SaveDialogOptions,
  MessageBoxOptions,
  OpenDialogReturnValue,
  SaveDialogReturnValue,
  MessageBoxReturnValue
} from 'electron';

export interface DialogAPI {
  showOpenDialog(options: OpenDialogOptions): Promise<OpenDialogReturnValue>;
  showSaveDialog(options: SaveDialogOptions): Promise<SaveDialogReturnValue>;
  showMessage(options: MessageBoxOptions): Promise<MessageBoxReturnValue>;
  showError(options: Omit<MessageBoxOptions, 'type'>): Promise<MessageBoxReturnValue>;
  showInfo(options: Omit<MessageBoxOptions, 'type'>): Promise<MessageBoxReturnValue>;
  showWarning(options: Omit<MessageBoxOptions, 'type'>): Promise<MessageBoxReturnValue>;
  showQuestion(options: Omit<MessageBoxOptions, 'type'>): Promise<MessageBoxReturnValue>;
}
```

```typescript
// src/renderer/dialog/index.ts
import { ipcRenderer } from 'electron';
import { DialogEvents } from '@/constants/ipc-events';
import type { DialogAPI } from './types';

class DialogManager implements DialogAPI {
  async showOpenDialog(options) {
    return await ipcRenderer.invoke(DialogEvents.DIALOG_OPEN, options);
  }

  async showSaveDialog(options) {
    return await ipcRenderer.invoke(DialogEvents.DIALOG_SAVE, options);
  }

  async showMessage(options) {
    return await ipcRenderer.invoke(DialogEvents.DIALOG_MESSAGE, options);
  }

  async showError(options) {
    return await ipcRenderer.invoke(DialogEvents.DIALOG_ERROR, options);
  }

  async showInfo(options) {
    return await ipcRenderer.invoke(DialogEvents.DIALOG_INFO, options);
  }

  async showWarning(options) {
    return await ipcRenderer.invoke(DialogEvents.DIALOG_WARNING, options);
  }

  async showQuestion(options) {
    return await ipcRenderer.invoke(DialogEvents.DIALOG_QUESTION, options);
  }
}

// 导出单例实例
export const dialog = new DialogManager();

// 扩展 window 接口
declare global {
  interface Window {
    dialog: DialogAPI;
  }
}
```

### 2.3 功能扩展

#### 2.3.1 错误处理
```typescript
// src/renderer/dialog/error-handler.ts
export class DialogErrorHandler {
  constructor(private dialog: DialogAPI) {}

  async handle(error: Error, title = '错误'): Promise<void> {
    try {
      await this.dialog.showError({
        title,
        message: error.message,
        detail: error.stack,
        buttons: ['确定']
      });
    } catch (e) {
      // 降级到控制台输出
      console.error('Failed to show error dialog:', e);
      console.error('Original error:', error);
    }
  }
}
```

#### 2.3.2 对话框队列
```typescript
// src/renderer/dialog/queue.ts
export class DialogQueue {
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;

  async add<T>(dialog: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await dialog();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const next = this.queue.shift();
    
    try {
      await next?.();
    } finally {
      this.isProcessing = false;
      this.processQueue();
    }
  }
}
```

### 2.4 使用示例

#### 2.4.1 基础使用
```typescript
// 在 React 组件中
import { useState } from 'react';

export function FileUploader() {
  const [filePath, setFilePath] = useState<string | null>(null);

  const handleFileSelect = async () => {
    try {
      const result = await window.dialog.showOpenDialog({
        title: '选择文件',
        properties: ['openFile'],
        filters: [
          { name: '图片', extensions: ['jpg', 'png'] }
        ]
      });

      if (!result.canceled && result.filePaths.length > 0) {
        setFilePath(result.filePaths[0]);
      }
    } catch (error) {
      await window.dialog.showError({
        title: '错误',
        message: '选择文件失败',
        detail: error.message
      });
    }
  };

  return (
    <div>
      <button onClick={handleFileSelect}>选择文件</button>
      {filePath && <p>已选择: {filePath}</p>}
    </div>
  );
}
```

#### 2.4.2 错误处理
```typescript
const errorHandler = new DialogErrorHandler(window.dialog);

try {
  await someOperation();
} catch (error) {
  await errorHandler.handle(error, '操作失败');
}
```

#### 2.4.3 对话框队列
```typescript
const dialogQueue = new DialogQueue();

async function showMultipleDialogs() {
  await dialogQueue.add(() => 
    window.dialog.showMessage({ message: '第一个消息' })
  );
  
  await dialogQueue.add(() =>
    window.dialog.showMessage({ message: '第二个消息' })
  );
}
```

### 2.5 测试

```typescript
  test('showOpenDialog invokes correct IPC event', async () => {
    const mockInvoke = jest.fn();
    (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };
    
    const options = {
      title: 'Test Dialog',
      properties: ['openFile']
    };
    
    await dialogManager.showOpenDialog(options);
    
    expect(mockInvoke).toHaveBeenCalledWith(
      DialogEvents.DIALOG_OPEN,
      options
    );
  });

  test('showError sets correct dialog type', async () => {
    const mockInvoke = jest.fn();
    (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };
    
    const options = {
      title: 'Error',
      message: 'Test error'
    };
    
    await dialogManager.showError(options);
    
    expect(mockInvoke).toHaveBeenCalledWith(
      DialogEvents.DIALOG_ERROR,
      options
    );
  });

  test('DialogQueue processes dialogs sequentially', async () => {
    const queue = new DialogQueue();
    const results: number[] = [];

    await Promise.all([
      queue.add(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        results.push(1);
      }),
      queue.add(async () => {
        results.push(2);
      })
    ]);

    expect(results).toEqual([1, 2]);
  });
});
```

### 2.6 最佳实践

#### 2.6.1 统一的错误处理

```typescript
// src/renderer/dialog/utils.ts
export function createSafeDialog<T extends (...args: any[]) => Promise<any>>(
  dialog: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await dialog(...args);
    } catch (error) {
      console.error('Dialog error:', error);
      // 显示错误对话框
      await window.dialog.showError({
        title: '对话框错误',
        message: error.message
      });
      throw error;
    }
  }) as T;
}

// 使用示例
const safeOpenDialog = createSafeDialog(window.dialog.showOpenDialog);

try {
  const result = await safeOpenDialog({
    title: '选择文件'
  });
} catch (error) {
  // 错误已经被处理,这里可以进行额外的处理
}
```

#### 2.6.2 对话框配置管理

```typescript
// src/renderer/dialog/config.ts
type DialogConfigKey = 'openFile' | 'saveFile' | 'error' | 'confirm';

export class DialogConfig {
  private static configs = new Map<DialogConfigKey, any>();

  static setConfig(key: DialogConfigKey, config: any) {
    this.configs.set(key, config);
  }

  static getConfig(key: DialogConfigKey) {
    return this.configs.get(key);
  }

  static getDefaultConfigs() {
    return {
      openFile: {
        title: '选择文件',
        properties: ['openFile'],
        filters: [
          { name: '所有文件', extensions: ['*'] }
        ]
      },
      saveFile: {
        title: '保存文件',
        defaultPath: 'untitled.txt'
      },
      error: {
        title: '错误',
        buttons: ['确定']
      },
      confirm: {
        type: 'question',
        buttons: ['确定', '取消'],
        defaultId: 0,
        cancelId: 1
      }
    };
  }
}

// 初始化默认配置
Object.entries(DialogConfig.getDefaultConfigs()).forEach(([key, config]) => {
  DialogConfig.setConfig(key as DialogConfigKey, config);
});

// 使用示例
async function openFile() {
  const config = DialogConfig.getConfig('openFile');
  const result = await window.dialog.showOpenDialog(config);
  return result;
}
```

#### 2.6.3 性能优化

```typescript
// src/renderer/dialog/cache.ts
export class DialogCache {
  private static cache = new Map<string, any>();
  private static maxAge = 5 * 60 * 1000; // 5分钟缓存

  static set(key: string, value: any) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  static get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  static clear() {
    this.cache.clear();
  }
}

// 使用示例
async function getRecentDirectory() {
  const cacheKey = 'lastDirectory';
  const cached = DialogCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  const result = await window.dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (!result.canceled) {
    DialogCache.set(cacheKey, result.filePaths[0]);
    return result.filePaths[0];
  }

  return null;
}
```

### 2.7 常见问题解决方案

#### 2.7.1 对话框被阻止

```typescript
// src/renderer/dialog/checker.ts
export class DialogChecker {
  static async checkPermission(): Promise<boolean> {
    try {
      await window.dialog.showMessage({
        type: 'none',
        message: 'Dialog Permission Check',
        buttons: ['OK']
      });
      return true;
    } catch (error) {
      console.error('Dialog permission denied:', error);
      return false;
    }
  }
}

// 使用前检查
async function safeShowDialog() {
  const hasPermission = await DialogChecker.checkPermission();
  if (!hasPermission) {
    // 显示备用UI或提示用户
    return;
  }
  
  // 正常显示对话框
}
```

#### 2.7.2 多窗口处理

```typescript
// src/renderer/dialog/window-manager.ts
export class DialogWindowManager {
  private static activeWindow: BrowserWindow | null = null;

  static setActiveWindow(window: BrowserWindow) {
    this.activeWindow = window;
  }

  static async showDialog<T>(
    dialogFn: (window: BrowserWindow) => Promise<T>
  ): Promise<T> {
    if (!this.activeWindow) {
      throw new Error('No active window found');
    }

    return await dialogFn(this.activeWindow);
  }
}

// 使用示例
await DialogWindowManager.showDialog(window => 
  dialog.showMessageBox(window, {
    message: '在当前窗口显示'
  })
);
```

### 2.8 安全考虑

#### 2.8.1 路径验证

```typescript
// src/renderer/dialog/security.ts
import { parse, resolve } from 'path';

export class DialogSecurity {
  private static allowedPaths: string[] = [];

  static addAllowedPath(path: string) {
    this.allowedPaths.push(resolve(path));
  }

  static validatePath(path: string): boolean {
    const resolvedPath = resolve(path);
    return this.allowedPaths.some(allowedPath => 
      resolvedPath.startsWith(allowedPath)
    );
  }

  static async validateDialog<T>(
    dialog: () => Promise<T>,
    validateResult: (result: T) => boolean
  ): Promise<T> {
    const result = await dialog();
    if (!validateResult(result)) {
      throw new Error('Invalid dialog result');
    }
    return result;
  }
}

// 使用示例
DialogSecurity.addAllowedPath(app.getPath('downloads'));

const result = await DialogSecurity.validateDialog(
  () => window.dialog.showOpenDialog({ 
    properties: ['openFile'] 
  }),
  result => {
    if (result.canceled) return true;
    return result.filePaths.every(path => 
      DialogSecurity.validatePath(path)
    );
  }
);
```

## 总结

通过本文,我们:
1. 了解了 Electron 原生对话框的基本使用
2. 实现了一个完整的 DialogManager
3. 提供了错误处理、性能优化等最佳实践
4. 解决了常见的问题和安全考虑

建议:
1. 根据实际需求选择性实现功能
2. 注意错误处理和安全验证
3. 合理使用缓存提升性能
4. 保持代码结构清晰便于维护

## 参考资源

- [Electron Dialog API](https://www.electronjs.org/docs/latest/api/dialog)
- [Electron 安全指南](https://www.electronjs.org/docs/tutorial/security)
- [IPC 通信最佳实践](https://www.electronjs.org/docs/latest/tutorial/ipc)