import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Divider,
  Progress,
  Tag,
  Alert,
  Spin,
  Row,
  Col,
  Descriptions,
  message,
} from 'antd';
import {
  InfoCircleOutlined,
  DownloadOutlined,
  SyncOutlined,
  SettingOutlined,
  ArrowLeftOutlined,
  BugOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { systemBridge } from '@renderer/bridge';

const { Title, Text } = Typography;

interface SystemInfo {
  platform: string;
  homedir: string;
  arch: string;
  nodeVersion: string;
  electronVersion: string;
  chromeVersion: string;
}

const SystemPage: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [updateInfo, setUpdateInfo] = useState<{
    hasUpdate: boolean;
    version?: string;
    downloadUrl?: string;
    fileName?: string;
    fileSize?: number;
    md5?: string;
    publishedAt?: string;
    message?: string;
    updateMethod?: 'auto' | 'manual';
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [updateProgress, setUpdateProgress] = useState<{
    type: 'check' | 'download' | 'downloaded';
    progress: { percent: number; transferred: number; total: number };
  } | null>(null);
  const [statusInfo, setStatusInfo] = useState<string>('');
  const [errorInfo, setErrorInfo] = useState<string>('');

  useEffect(() => {
    loadSystemInfo();

    systemBridge.onUpdateProgress(data => {
      console.log('收到更新进度:', data);
      setUpdateProgress(data);
      setErrorInfo(''); // 清除之前的错误信息
    });

    systemBridge.onUpdateError(data => {
      console.log('收到更新错误:', data);
      setErrorInfo(data.message);
      message.error(data.message);
    });

    return () => {
      systemBridge.removeUpdateProgressListener();
      systemBridge.removeUpdateErrorListener();
    };
  }, []);

  const loadSystemInfo = async () => {
    try {
      const result = await systemBridge.getSystemInfo();
      if (result.success && result.data) {
        setSystemInfo(result.data);
      }
    } catch (error) {
      console.error('Failed to load system info:', error);
      message.error('加载系统信息失败');
    }
  };

  const checkForUpdates = async () => {
    try {
      setLoading(true);
      const result = await systemBridge.checkForUpdates({
        serverUrl: 'http://192.168.3.18:8080',
        autoDownload: false,
      });
      console.log('检查更新结果:', result);
      console.log('result.success:', result.success);
      console.log('result.data:', result.data);
      console.log('result.data?.hasUpdate:', result.data?.hasUpdate);

      if (result.success && result.data) {
        console.log('进入成功分支，设置updateInfo:', result.data);
        setUpdateInfo(result.data);

        if (result.data.hasUpdate) {
          console.log('检测到有更新，hasUpdate为true');
          message.success(`发现新版本: ${result.data.version} (手动更新)`);
        } else {
          console.log('检测到无更新，hasUpdate为false');
          message.success('当前已是最新版本');
        }
      } else {
        message.error('检查更新失败: ' + result.error);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      message.error('检查更新异常');
    } finally {
      setLoading(false);
    }
  };

  const downloadAndInstall = async () => {
    if (!updateInfo || !updateInfo.hasUpdate) {
      message.error('没有可用的更新');
      return;
    }

    try {
      setLoading(true);
      const result = await systemBridge.downloadAndInstall();

      if (result.success) {
        message.success('更新下载完成，安装包已自动打开');
      } else {
        message.error('下载更新失败: ' + result.error);
      }
    } catch (error) {
      console.error('Error downloading update:', error);
      message.error('下载更新异常');
    } finally {
      setLoading(false);
    }
  };

  const quitAndInstall = async () => {
    try {
      const result = await systemBridge.quitAndInstall();
      if (!result.success) {
        message.error('重启安装失败: ' + result.error);
      }
    } catch (error) {
      console.error('Error quitting and installing:', error);
      message.error('重启安装异常');
    }
  };

  const getDownloadsPath = async () => {
    try {
      const result = await systemBridge.getDownloadsPath();
      if (result.success && result.data) {
        message.success('下载路径: ' + result.data);
      } else {
        message.error('获取下载路径失败: ' + result.error);
      }
    } catch (error) {
      console.error('Error getting downloads path:', error);
      message.error('获取下载路径异常');
    }
  };

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        paddingBottom: '50px',
      }}
    >
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <Space>
              <Button
                type='link'
                icon={<ArrowLeftOutlined />}
                onClick={() => (window.location.hash = '/')}
              >
                返回首页
              </Button>
              <Divider type='vertical' />
              <Title level={2} style={{ margin: 0 }}>
                <InfoCircleOutlined style={{ marginRight: 8 }} />
                系统信息与更新
              </Title>
            </Space>
          </Card>
        </Col>

        <Col span={24} lg={12}>
          <Card
            title={
              <Space>
                <SettingOutlined />
                <span>系统信息</span>
              </Space>
            }
            loading={!systemInfo}
          >
            {systemInfo ? (
              <Descriptions column={1} size='small'>
                <Descriptions.Item label='操作系统'>
                  {systemInfo.platform}
                </Descriptions.Item>
                <Descriptions.Item label='用户目录'>
                  {systemInfo.homedir}
                </Descriptions.Item>
                <Descriptions.Item label='系统架构'>
                  {systemInfo.arch}
                </Descriptions.Item>
                <Descriptions.Item label='Node.js 版本'>
                  {systemInfo.nodeVersion}
                </Descriptions.Item>
                <Descriptions.Item label='Electron 版本'>
                  {systemInfo.electronVersion}
                </Descriptions.Item>
                <Descriptions.Item label='Chrome 版本'>
                  {systemInfo.chromeVersion}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size='large' />
                <div style={{ marginTop: 16 }}>
                  <Text type='secondary'>正在加载系统信息...</Text>
                </div>
              </div>
            )}
          </Card>
        </Col>

        <Col span={24} lg={12}>
          <Card
            title={
              <Space>
                <DownloadOutlined />
                <span>应用更新</span>
              </Space>
            }
          >
            <Space direction='vertical' style={{ width: '100%' }} size='large'>
              <Divider>智能更新系统 (根据平台自动选择)</Divider>

              <Space wrap>
                <Button
                  type='primary'
                  icon={<SyncOutlined />}
                  onClick={checkForUpdates}
                  loading={loading}
                >
                  检查更新
                </Button>
                <Button
                  type='primary'
                  icon={<DownloadOutlined />}
                  onClick={downloadAndInstall}
                  loading={loading}
                  disabled={!updateInfo?.hasUpdate}
                >
                  下载并安装
                </Button>
                {updateInfo?.updateMethod === 'auto' && (
                  <Button
                    type='default'
                    danger
                    onClick={quitAndInstall}
                    disabled={!updateInfo?.hasUpdate}
                  >
                    重启并安装
                  </Button>
                )}
              </Space>

              {updateInfo && (
                <Alert
                  message='更新信息'
                  description={
                    <Space direction='vertical' style={{ width: '100%' }}>
                      <div>
                        <Text strong>更新状态: </Text>
                        <Tag color={updateInfo.hasUpdate ? 'orange' : 'green'}>
                          {updateInfo.hasUpdate
                            ? '有新版本可用'
                            : '已是最新版本'}
                        </Tag>
                        {updateInfo.updateMethod && (
                          <Tag
                            color={
                              updateInfo.updateMethod === 'auto'
                                ? 'blue'
                                : 'purple'
                            }
                          >
                            {updateInfo.updateMethod === 'auto'
                              ? '自动更新 (Windows)'
                              : '手动更新 (macOS/Linux)'}
                          </Tag>
                        )}
                      </div>
                      {updateInfo.version && (
                        <div>
                          <Text strong>版本号: </Text>
                          <Text code>{updateInfo.version}</Text>
                        </div>
                      )}
                      {updateInfo.fileSize && (
                        <div>
                          <Text strong>文件大小: </Text>
                          <Text>
                            {(updateInfo.fileSize / 1024 / 1024).toFixed(2)} MB
                          </Text>
                        </div>
                      )}
                    </Space>
                  }
                  type={updateInfo.hasUpdate ? 'warning' : 'success'}
                  showIcon
                />
              )}

              <Divider>调试信息</Divider>

              <Space wrap>
                <Button icon={<FolderOutlined />} onClick={getDownloadsPath}>
                  查看下载路径
                </Button>
              </Space>

              {updateProgress && (
                <Card size='small' style={{ backgroundColor: '#f6ffed' }}>
                  <Space direction='vertical' style={{ width: '100%' }}>
                    <div>
                      <Text strong>更新进度: </Text>
                      <Tag color='processing'>{updateProgress.type}</Tag>
                    </div>

                    <Progress
                      percent={Math.round(updateProgress.progress.percent)}
                      status={
                        updateProgress.type === 'downloaded'
                          ? 'success'
                          : 'active'
                      }
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                    />

                    {updateProgress.progress.total > 0 && (
                      <div>
                        <Text type='secondary'>
                          下载进度:{' '}
                          {(
                            updateProgress.progress.transferred /
                            1024 /
                            1024
                          ).toFixed(2)}{' '}
                          MB /
                          {(
                            updateProgress.progress.total /
                            1024 /
                            1024
                          ).toFixed(2)}{' '}
                          MB
                        </Text>
                      </div>
                    )}
                  </Space>
                </Card>
              )}

              {errorInfo && (
                <Alert
                  message='错误信息'
                  description={errorInfo}
                  type='error'
                  showIcon
                  closable
                  onClose={() => setErrorInfo('')}
                />
              )}
            </Space>
          </Card>
        </Col>

        {statusInfo && (
          <Col span={24}>
            <Card
              title={
                <Space>
                  <BugOutlined />
                  <span>调试状态信息</span>
                  <Button
                    size='small'
                    type='text'
                    onClick={() => setStatusInfo('')}
                  >
                    清除
                  </Button>
                </Space>
              }
              size='small'
            >
              <div
                style={{
                  backgroundColor: '#fafafa',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  maxHeight: '300px',
                  minHeight: '200px',
                  overflow: 'auto',
                  overflowY: 'scroll',
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    padding: '16px',
                    fontSize: '12px',
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: '1.5',
                    color: '#2f3349',
                  }}
                >
                  {statusInfo}
                </pre>
              </div>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default SystemPage;
