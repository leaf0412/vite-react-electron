import React, { useState, useEffect, useCallback } from 'react';
import {
  Input,
  Button,
  Table,
  Modal,
  Breadcrumb,
  message,
  Tooltip,
  Space,
  Spin,
} from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  DeleteOutlined,
  EditOutlined,
  CopyOutlined,
  ScissorOutlined,
  PlusOutlined,
  SearchOutlined,
  HomeOutlined,
  UploadOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import './FileManager.css';

interface FileItem {
  name: string;
  isDirectory: boolean;
  size: number;
  modifiedTime: string;
  path: string;
}

interface FileManagerProps {
  initialPath: string;
  onPathChange?: (path: string | null) => void;
}

const FileManager: React.FC<FileManagerProps> = ({
  initialPath,
  onPathChange,
}) => {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [pathParts, setPathParts] = useState<string[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<
    'text' | 'image' | 'video' | 'pdf' | 'unknown'
  >('unknown');
  const [previewKey, setPreviewKey] = useState<number>(0); // 添加key来强制刷新视频
  const [newItemName, setNewItemName] = useState('');
  const [isDirectory, setIsDirectory] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [clipboard, setClipboard] = useState<{
    file: FileItem;
    action: 'copy' | 'cut';
  } | null>(null);

  useEffect(() => {
    const parts = currentPath.split('/').filter(Boolean);
    setPathParts(parts);
  }, [currentPath]);

  const loadFiles = useCallback(
    async (path: string) => {
      try {
        setLoading(true);
        // Don't allow navigating to root directory
        if (
          window.ipcRenderer.platform === 'darwin' &&
          (!path || path === '/')
        ) {
          path = '/Users';
        } else if (
          window.ipcRenderer.platform === 'win32' &&
          (!path || path === '/')
        ) {
          path = 'C:\\';
        }

        const result = await window.ipcRenderer.readDirectory(path);
        const files = result.map(file => ({
          ...file,
          modifiedTime: file.modifiedTime.toLocaleString(),
        }));
        setFiles(
          files.sort((a: FileItem, b: FileItem) => {
            if (a.isDirectory === b.isDirectory) {
              return a.name.localeCompare(b.name);
            }
            return a.isDirectory ? -1 : 1;
          })
        );
        setCurrentPath(path);
        if (onPathChange) {
          onPathChange(path);
        }
      } catch (error) {
        console.error('Error loading files:', error);
        message.error('加载目录内容失败');
      } finally {
        setLoading(false);
      }
    },
    [onPathChange]
  );

  useEffect(() => {
    if (initialPath) {
      setCurrentPath(initialPath);
      loadFiles(initialPath);
    }
  }, [initialPath, loadFiles]);

  const handleOpen = async (file: FileItem) => {
    if (file.isDirectory) {
      loadFiles(file.path);
    } else {
      try {
        // 检查文件类型
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const isImage = [
          'jpg',
          'jpeg',
          'png',
          'gif',
          'bmp',
          'webp',
          'svg',
        ].includes(ext);
        const isVideo = ['mp4', 'webm', 'ogg'].includes(ext);
        const isPdf = ['pdf'].includes(ext);
        const isBinary = [
          'exe',
          'dll',
          'so',
          'dylib',
          'bin',
          'dat',
          'db',
          'sqlite',
          'iso',
          'dmg',
          'pkg',
          'zip',
          'rar',
          '7z',
          'tar',
          'gz',
          'doc',
          'docx',
          'xls',
          'xlsx',
          'ppt',
          'pptx',
        ].includes(ext);

        if (isBinary) {
          message.info('二进制文件无法预览');
          return;
        }

        if (isImage) {
          setPreviewType('image');
          setPreviewContent(file.path);
          setIsPreviewModalVisible(true);
        } else if (isVideo) {
          setPreviewType('video');
          setPreviewContent(file.path);
          setPreviewKey(Date.now()); // 更新key
          setIsPreviewModalVisible(true);
        } else if (isPdf) {
          setPreviewType('pdf');
          setPreviewContent(file.path);
          setIsPreviewModalVisible(true);
        } else {
          // 对于所有其他文件，尝试以文本方式打开
          try {
            const content = await window.ipcRenderer.readFile(file.path);
            setPreviewType('text');
            setPreviewContent(content);
            setIsPreviewModalVisible(true);
          } catch (error) {
            message.error('无法预览此文件');
            console.error('Error reading file:', error);
          }
        }
      } catch (error) {
        message.error('打开文件失败');
        console.error('Error opening file:', error);
      }
    }
  };

  const handleDelete = async (file: FileItem) => {
    try {
      const result = await window.ipcRenderer.showQuestion({
        title: '确认删除',
        message: `确定要删除 ${file.name} 吗？`,
        buttons: ['是', '否'],
        defaultId: 1,
      });

      if (result.response === 0) {
        await window.ipcRenderer.delete(file.path);
        message.success('删除成功');
        loadFiles(currentPath);
      }
    } catch (error) {
      message.error('删除失败');
      console.error('Error deleting:', error);
    }
  };

  const handleCreate = async () => {
    if (!newItemName) {
      message.error('名称不能为空');
      return;
    }

    try {
      const newPath = `${currentPath}/${newItemName}`;
      const exists = await window.ipcRenderer.exists(newPath);

      if (exists) {
        message.error('该名称已存在');
        return;
      }

      if (isDirectory) {
        await window.ipcRenderer.createDirectory(newPath);
      } else {
        await window.ipcRenderer.createFile(newPath);
      }

      message.success(`${isDirectory ? '文件夹' : '文件'}创建成功`);
      setIsCreateModalVisible(false);
      setNewItemName('');
      loadFiles(currentPath);
    } catch (error) {
      message.error('创建失败');
      console.error('Error creating:', error);
    }
  };

  const handleRename = async () => {
    if (!selectedFile || !newItemName) return;

    try {
      const newPath = `${currentPath}/${newItemName}`;
      const exists = await window.ipcRenderer.exists(newPath);

      if (exists) {
        message.error('该名称已存在');
        return;
      }

      await window.ipcRenderer.move(selectedFile.path, newPath);
      message.success('重命名成功');
      setIsRenameModalVisible(false);
      setNewItemName('');
      setSelectedFile(null);
      loadFiles(currentPath);
    } catch (error) {
      message.error('重命名失败');
      console.error('Error renaming:', error);
    }
  };

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
      const exists = await window.ipcRenderer.exists(newPath);

      if (exists) {
        const result = await window.ipcRenderer.showQuestion({
          title: '文件已存在',
          message: '要如何处理已存在的文件？',
          buttons: ['替换', '创建副本', '取消'],
          defaultId: 1,
        });

        if (result.response === 2) return; // Cancel

        if (result.response === 1) {
          // Create Copy
          let baseName = clipboard.file.name;
          let extension = '';
          const lastDotIndex = baseName.lastIndexOf('.');
          if (lastDotIndex !== -1) {
            extension = baseName.substring(lastDotIndex);
            baseName = baseName.substring(0, lastDotIndex);
          }

          let counter = 1;
          let newFileName;
          do {
            newFileName = `${baseName} (${counter})${extension}`;
            counter++;
          } while (
            await window.ipcRenderer.exists(`${currentPath}/${newFileName}`)
          );

          newPath = `${currentPath}/${newFileName}`;
        }
      }

      if (clipboard.action === 'copy') {
        await window.ipcRenderer.copy(clipboard.file.path, newPath);
      } else {
        await window.ipcRenderer.move(clipboard.file.path, newPath);
      }

      message.success(`${clipboard.action === 'copy' ? '复制' : '移动'}成功`);
      setClipboard(null);
      loadFiles(currentPath);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      message.error(`${clipboard.action === 'copy' ? '复制' : '移动'}失败: ${errorMessage}`);
      console.error('Error pasting:', error);
    }
  };

  const handleBrowse = async () => {
    try {
      const result = await window.ipcRenderer.openDialog({
        properties: ['openDirectory'],
      });

      if (!result.canceled && result.filePaths.length > 0) {
        loadFiles(result.filePaths[0]);
      }
    } catch (error) {
      message.error('浏览目录失败');
      console.error('Error browsing:', error);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
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
      key: 'size',
      render: (size: number, record: FileItem) =>
        record.isDirectory ? '-' : formatSize(size),
    },
    {
      title: '修改时间',
      dataIndex: 'modifiedTime',
      key: 'modifiedTime',
      render: (date: string) => formatDate(date),
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: FileItem) => (
        <Space>
          <Tooltip title='重命名'>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedFile(record);
                setNewItemName(record.name);
                setIsRenameModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title='复制'>
            <Button
              icon={<CopyOutlined />}
              onClick={() => handleCopy(record)}
            />
          </Tooltip>
          <Tooltip title='剪切'>
            <Button
              icon={<ScissorOutlined />}
              onClick={() => handleCut(record)}
            />
          </Tooltip>
          <Tooltip title='删除'>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const formatSize = (size: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let index = 0;
    let convertedSize = size;

    while (convertedSize >= 1024 && index < units.length - 1) {
      convertedSize /= 1024;
      index++;
    }

    return `${convertedSize.toFixed(2)} ${units[index]}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className='file-manager'>
      <div className='file-manager-header'>
        <Space direction='vertical' style={{ width: '100%' }}>
          <Space>
            <Button
              icon={<HomeOutlined />}
              onClick={() =>
                loadFiles(
                  window.ipcRenderer.platform === 'darwin' ? '/' : 'C:\\'
                )
              }
            >
              主页
            </Button>
            <Button icon={<FolderOpenOutlined />} onClick={handleBrowse}>
              浏览
            </Button>
            <Button
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalVisible(true)}
            >
              新建
            </Button>
            {clipboard && (
              <Button icon={<UploadOutlined />} onClick={handlePaste}>
                粘贴
              </Button>
            )}
            <Input
              placeholder='搜索文件...'
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
          </Space>

          <Breadcrumb
            items={[
              {
                key: 'user_home',
                title: (
                  <div
                    onClick={() =>
                      loadFiles(
                        window.ipcRenderer.platform === 'darwin' ? '/' : 'C:\\'
                      )
                    }
                  >
                    <HomeOutlined /> 主页
                  </div>
                ),
              },
              ...pathParts.map((part, index) => ({
                key: part,
                title: (
                  <div
                    onClick={() => {
                      const path =
                        window.ipcRenderer.platform === 'win32'
                          ? pathParts.slice(0, index + 1).join('\\')
                          : '/' + pathParts.slice(0, index + 1).join('/');
                      loadFiles(path);
                    }}
                  >
                    {part}
                  </div>
                ),
              })),
            ]}
          />
        </Space>
      </div>

      <Spin spinning={loading}>
        <Table
          dataSource={filteredFiles}
          columns={columns}
          onRow={record => ({
            onDoubleClick: () => handleOpen(record),
          })}
          pagination={false}
          rowKey='path'
        />
      </Spin>

      <Modal
        title={`创建新的${isDirectory ? '文件夹' : '文件'}`}
        open={isCreateModalVisible}
        onOk={handleCreate}
        onCancel={() => {
          setIsCreateModalVisible(false);
          setNewItemName('');
        }}
      >
        <Space direction='vertical' style={{ width: '100%' }}>
          <Space>
            <Button
              type={isDirectory ? 'primary' : 'default'}
              onClick={() => setIsDirectory(true)}
            >
              文件夹
            </Button>
            <Button
              type={!isDirectory ? 'primary' : 'default'}
              onClick={() => setIsDirectory(false)}
            >
              文件
            </Button>
          </Space>
          <Input
            placeholder={`输入${isDirectory ? '文件夹' : '文件'}名称`}
            value={newItemName}
            onChange={e => setNewItemName(e.target.value)}
          />
        </Space>
      </Modal>

      <Modal
        title='重命名'
        open={isRenameModalVisible}
        onOk={handleRename}
        onCancel={() => {
          setIsRenameModalVisible(false);
          setNewItemName('');
          setSelectedFile(null);
        }}
      >
        <Input
          placeholder='输入新名称'
          value={newItemName}
          onChange={e => setNewItemName(e.target.value)}
        />
      </Modal>

      <Modal
        title='预览'
        open={isPreviewModalVisible}
        onCancel={() => {
          setIsPreviewModalVisible(false);
          setPreviewContent(null);
          setPreviewType('unknown');
          setPreviewKey(0); // 重置key
        }}
        footer={null}
        centered
        width={'90vw'}
      >
        {previewType === 'image' && previewContent && (
          <img
            src={`file://${previewContent}`}
            alt='预览'
            style={{ maxWidth: '100%', maxHeight: '90vh' }}
          />
        )}
        {previewType === 'video' && previewContent && (
          <video
            key={previewKey} // 使用key强制重新创建video元素
            controls
            autoPlay
            style={{ maxWidth: '100%', maxHeight: '90vh' }}
          >
            <source src={`file://${previewContent}?t=${previewKey}`} />{' '}
            {/* 添加时间戳参数避免缓存 */}
            您的浏览器不支持video标签。
          </video>
        )}
        {previewType === 'pdf' && previewContent && (
          <iframe
            src={`file://${previewContent}`}
            style={{ width: '100%', height: '90vh', border: 'none' }}
          />
        )}
        {previewType === 'text' && previewContent && (
          <pre
            style={{
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '16px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
            }}
          >
            {previewContent}
          </pre>
        )}
      </Modal>
    </div>
  );
};

export default FileManager;
