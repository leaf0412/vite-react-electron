## 手把手使用 Vite + React + Electron 构建的现代桌面应用程序模板 - 文件管理器

一个使用 Vite + React + Electron 构建的现代桌面应用程序模板。

仓库地址：[github.com/leaf0412/vi…](https://github.com/leaf0412/vite-react-electron/tree/file-manager)

[手把手使用 Vite + React + Electron 构建的现代桌面应用程序模板 一 初始化](https://juejin.cn/spost/7439949193815277604)

[手把手使用 Vite + React + Electron 构建的现代桌面应用程序模板 二 窗口管理](https://juejin.cn/post/7439964170990764086)

[手把手使用 Vite + React + Electron 构建的现代桌面应用程序模板 三 对话框管理](https://juejin.cn/post/7439990692749901887)


## 简介

文件管理器是 Electron 桌面应用中一个常见的需求。本文将详细介绍如何实现一个功能完整的文件管理器,包括文件浏览、预览、操作等功能。

## 整体架构

文件管理器采用主进程-渲染进程分离的架构:
- 主进程: 负责文件系统操作
- 渲染进程: 负责界面展示和用户交互
- IPC 通信: 连接主进程和渲染进程

### 核心功能
- 文件/文件夹浏览
- 文件预览
- 创建文件/文件夹
- 复制/剪切/粘贴
- 重命名/删除
- 搜索过滤

## 主进程实现

主进程负责所有的文件系统操作,采用单例模式设计。

### FileManager 类设计

```typescript
// 文件信息接口
interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;  
  size: number;
  modifiedTime: Date;
  createdTime: Date;
}

export class FileManager {
  private static instance: FileManager | null = null;

  // 单例模式实现
  public static getInstance(): FileManager {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager();
    }
    return FileManager.instance;
  }

  // 初始化 IPC 处理器
  private registerHandlers(): void {
    ipcMain.handle(Events.FILE_READ_DIRECTORY, this.handleReadDirectory.bind(this));
    ipcMain.handle(Events.FILE_CREATE_DIRECTORY, this.handleCreateDirectory.bind(this));
    ipcMain.handle(Events.FILE_CREATE_FILE, this.handleCreateFile.bind(this));
    ipcMain.handle(Events.FILE_READ, this.handleRead.bind(this));
    ipcMain.handle(Events.FILE_COPY, this.handleCopy.bind(this));
    ipcMain.handle(Events.FILE_MOVE, this.handleMove.bind(this));
    ipcMain.handle(Events.FILE_DELETE, this.handleDelete.bind(this));
    ipcMain.handle(Events.FILE_GET_INFO, this.handleGetInfo.bind(this));
    ipcMain.handle(Events.FILE_EXISTS, this.handleExists.bind(this));
  }

  // 读取目录内容
  private async handleReadDirectory(dirPath: string): Promise<FileInfo[]> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return Promise.all(
      entries.map(async entry => {
        const fullPath = path.join(dirPath, entry.name);
        const stats = await fs.stat(fullPath);
        
        return {
          name: entry.name,
          path: fullPath,
          isDirectory: entry.isDirectory(),
          size: stats.size,
          modifiedTime: stats.mtime,
          createdTime: stats.birthtime
        };
      })
    );
  }

  // 文件操作实现
  private async handleCopy(sourcePath: string, destinationPath: string): Promise<void> {
    const stats = await fs.stat(sourcePath);
    
    if (stats.isDirectory()) {
      await fs.mkdir(destinationPath, { recursive: true });
      const files = await fs.readdir(sourcePath);
      
      for (const file of files) {
        const srcPath = path.join(sourcePath, file);
        const destPath = path.join(destinationPath, file);
        await this.copyPath(srcPath, destPath);
      }
    } else {
      await fs.copyFile(sourcePath, destinationPath);
    }
  }

  // 其他文件操作方法...
}
```

### 路径规范化处理

为了兼容不同操作系统,需要对路径进行规范化处理:

```typescript
private normalizePath(inputPath: string): string {
  // 移除 Windows 下的前导斜杠
  return inputPath.startsWith('/') && process.platform === 'win32'
    ? inputPath.slice(1)
    : inputPath;
}
```

## 渲染进程实现

渲染进程使用 React 和 Ant Design 构建用户界面。

### 组件结构

```typescript
interface FileManagerProps {
  initialPath: string;
  onPathChange?: (path: string | null) => void;
}

const FileManager: React.FC<FileManagerProps> = ({
  initialPath,
  onPathChange,
}) => {
  // 状态管理
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [clipboard, setClipboard] = useState<{
    file: FileItem;
    action: 'copy' | 'cut';
  } | null>(null);
  
  // ... 其他状态
}
```

### 文件列表展示

使用 Ant Design Table 组件展示文件列表:

```typescript
const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    render: (text: string, record: FileItem) => (
      <Space>
        {record.isDirectory ? <FolderOutlined /> : <FileOutlined />}
        {text}
      </Space>
    ),
  },
  {
    title: '大小',
    dataIndex: 'size',
    render: (size: number, record: FileItem) =>
      record.isDirectory ? '-' : formatSize(size),
  },
  {
    title: '修改时间',
    dataIndex: 'modifiedTime',
    render: (date: string) => formatDate(date),
  },
  {
    title: '操作',
    render: (record: FileItem) => (
      <Space>
        <Button icon={<EditOutlined />} onClick={() => handleRename(record)} />
        <Button icon={<CopyOutlined />} onClick={() => handleCopy(record)} />
        <Button icon={<ScissorOutlined />} onClick={() => handleCut(record)} />
        <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
      </Space>
    ),
  },
];
```

### 文件操作实现

#### 复制/剪切/粘贴

```typescript
const handleCopy = (file: FileItem) => {
  setClipboard({ file, action: 'copy' });
  message.info('文件已复制到剪贴板');
};

const handleCut = (file: FileItem) => {
  setClipboard({ file, action: 'cut' });
  message.info('文件已剪切到剪贴板');
};

const handlePaste = async () => {
  if (!clipboard) return;

  try {
    let newPath = `${currentPath}/${clipboard.file.name}`;
    // 检查文件是否存在
    if (await window.ipcRenderer.exists(newPath)) {
      const result = await window.ipcRenderer.showQuestion({
        title: '文件已存在',
        message: '要如何处理已存在的文件？',
        buttons: ['替换', '创建副本', '取消'],
      });

      if (result.response === 2) return; // 取消
      if (result.response === 1) {
        // 创建副本
        newPath = await generateUniquePath(newPath);
      }
    }

    // 执行复制或移动操作
    if (clipboard.action === 'copy') {
      await window.ipcRenderer.copy(clipboard.file.path, newPath);
    } else {
      await window.ipcRenderer.move(clipboard.file.path, newPath);
    }

    message.success(`${clipboard.action === 'copy' ? '复制' : '移动'}成功`);
    setClipboard(null);
    loadFiles(currentPath);
  } catch (error) {
    message.error(`操作失败: ${error.message}`);
  }
};
```

#### 文件预览

实现不同类型文件的预览功能:

```typescript
const handleOpen = async (file: FileItem) => {
  if (file.isDirectory) {
    loadFiles(file.path);
  } else {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    
    // 判断文件类型
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext);
    const isVideo = ['mp4', 'webm', 'ogg'].includes(ext);
    const isPdf = ext === 'pdf';
    const isBinary = ['exe', 'dll', 'zip', 'doc'].includes(ext);

    if (isBinary) {
      message.info('二进制文件无法预览');
      return;
    }

    try {
      if (isImage) {
        setPreviewType('image');
        setPreviewContent(file.path);
      } else if (isVideo) {
        setPreviewType('video');
        setPreviewContent(file.path);
      } else if (isPdf) {
        setPreviewType('pdf');
        setPreviewContent(file.path);
      } else {
        // 尝试以文本方式打开
        const content = await window.ipcRenderer.readFile(file.path);
        setPreviewType('text');
        setPreviewContent(content);
      }
      setIsPreviewModalVisible(true);
    } catch (error) {
      message.error('无法预览此文件');
    }
  }
};
```

预览模态框实现:

```typescript
<Modal
  title="预览"
  open={isPreviewModalVisible}
  onCancel={() => {
    setIsPreviewModalVisible(false);
    setPreviewContent(null);
    setPreviewType('unknown');
  }}
  width={'90vw'}
>
  {previewType === 'image' && (
    <img
      src={`file://${previewContent}`}
      alt="预览"
      style={{ maxWidth: '100%', maxHeight: '90vh' }}
    />
  )}
  {previewType === 'video' && (
    <video controls autoPlay style={{ maxWidth: '100%' }}>
      <source src={`file://${previewContent}`} />
    </video>
  )}
  {previewType === 'pdf' && (
    <iframe
      src={`file://${previewContent}`}
      style={{ width: '100%', height: '90vh' }}
    />
  )}
  {previewType === 'text' && (
    <pre style={{
      maxHeight: '90vh',
      overflow: 'auto',
      padding: '16px',
      backgroundColor: '#f5f5f5'
    }}>
      {previewContent}
    </pre>
  )}
</Modal>
```

## 错误处理

### 主进程错误处理

```typescript
private async handleOperation(operation: () => Promise<void>) {
  try {
    await operation();
  } catch (error) {
    console.error('Operation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`操作失败: ${errorMessage}`);
  }
}
```

### 渲染进程错误处理

```typescript
const handleOperation = async (operation: () => Promise<void>) => {
  try {
    await operation();
  } catch (error) {
    message.error(`操作失败: ${error.message}`);
  }
};
```

## 性能优化

1. 文件列表虚拟化:
```typescript
<Table
  components={{
    body: {
      wrapper: VirtualTable
    }
  }}
  pagination={false}
  scroll={{ y: 500 }}
  // ...其他属性
/>
```

2. 防抖搜索:
```typescript
const debouncedSearch = useCallback(
  debounce((value: string) => {
    setFilteredFiles(
      files.filter(file =>
        file.name.toLowerCase().includes(value.toLowerCase())
      )
    );
  }, 300),
  [files]
);
```

3. 大文件读取优化:
```typescript
const readLargeFile = async (path: string) => {
  const stream = fs.createReadStream(path, {
    encoding: 'utf-8',
    highWaterMark: 1024 * 1024 // 1MB chunks
  });

  let content = '';
  for await (const chunk of stream) {
    content += chunk;
    if (content.length > 1024 * 1024 * 10) { // 限制 10MB
      break;
    }
  }
  return content;
};
```

## 安全考虑

1. 路径验证
```typescript
const isPathSafe = (path: string): boolean => {
  const normalizedPath = path.normalize();
  return !normalizedPath.includes('..');
};
```

2. 文件类型检查
```typescript
const isSafeFileType = (filename: string): boolean => {
  const ext = path.extname(filename).toLowerCase();
  const dangerousExts = ['.exe', '.bat', '.cmd', '.vbs'];
  return !dangerousExts.includes(ext);
};
```

## 总结

本文介绍了如何实现一个完整的 Electron 文件管理器,包括:
1. 主进程文件系统操作
2. 渲染进程界面实现
3. 文件预览功能
4. 错误处理机制
5. 性能优化方案
6. 安全性考虑

通过合理的架构设计和功能实现,我们可以构建一个功能完善、性能优秀的文件管理器。

建议在实际应用中根据具体需求:
- 调整文件操作的权限控制
- 优化大文件处理机制
- 添加更多文件格式的预览支持
- 实现文件拖拽功能
- 添加文件备份功能

## 参考资源

- [Electron 文档](https://www.electronjs.org/docs/latest/)
- [Node.js 文件系统 API](https://nodejs.org/api/fs.html)
- [Ant Design 组件库](https://ant.design/)