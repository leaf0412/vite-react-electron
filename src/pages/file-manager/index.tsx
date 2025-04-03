import React, { useState } from 'react';
import { Button, Empty, message } from 'antd';
import { FolderOpenOutlined } from '@ant-design/icons';
import FileManager from '@/components/FileManager/FileManager';
import './index.css';
import { Link } from 'react-router-dom';

const FileManagerPage: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const handleSelectFolder = async () => {
    try {
      const result = await window.ipcRenderer.openDialog({
        title: '选择文件夹',
        properties: ['openDirectory'],
        buttonLabel: '选择文件夹',
      });

      if (!result.canceled && result.filePaths.length > 0) {
        const selectedPath = result.filePaths[0];
        setSelectedPath(selectedPath);
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
      message.error('Failed to select directory. Please try again.');
    }
  };

  return (
    <div className="file-manager-page">
      <div className="file-manager-header">
        <Link to="/">返回首页</Link>
        <Button 
          type="primary" 
          icon={<FolderOpenOutlined />}
          onClick={handleSelectFolder}
        >
          {selectedPath ? '修改文件夹' : '选择文件夹'}
        </Button>
      </div>
      
      {!selectedPath ? (
        <div className="select-folder">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="请选择文件夹"
          >
            <Button 
              type="primary" 
              icon={<FolderOpenOutlined />}
              onClick={handleSelectFolder}
            >
              选择文件夹
            </Button>
          </Empty>
        </div>
      ) : (
        <div className="file-manager-container">
          <FileManager initialPath={selectedPath} onPathChange={setSelectedPath} />
        </div>
      )}
    </div>
  );
};

export default FileManagerPage;
