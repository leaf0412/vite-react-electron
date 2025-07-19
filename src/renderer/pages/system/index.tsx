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
  Steps,
  message
} from 'antd';
import {
  InfoCircleOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  SettingOutlined,
  ArrowLeftOutlined,
  BugOutlined
} from '@ant-design/icons';
import { systemBridge } from '@renderer/bridge';

const { Title, Text } = Typography;
const { Step } = Steps;

interface SystemInfo {
  platform: string;
  homedir: string;
  arch: string;
  nodeVersion: string;
  electronVersion: string;
  chromeVersion: string;
}

interface UpdateInfo {
  status: boolean;
  needUpdate: boolean;
  version: string;
}

const SystemPage: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [updateProgress, setUpdateProgress] = useState<{
    type: 'check' | 'download' | 'downloaded';
    progress: { percent: number; transferred: number; total: number };
  } | null>(null);
  const [statusInfo, setStatusInfo] = useState<string>('');
  const [errorInfo, setErrorInfo] = useState<string>('');

    useEffect(() => {
    loadSystemInfo();
    
    systemBridge.onUpdateProgress((data) => {
      console.log('收到更新进度:', data);
      setUpdateProgress(data);
      setErrorInfo(''); // 清除之前的错误信息
    });

    systemBridge.onUpdateError((data) => {
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

  const initUpdater = async () => {
    try {
      setLoading(true);

      const versionResult = await systemBridge.getVersion();
      console.log('versionResult', versionResult);
      const currentVersion = versionResult.success ? versionResult.data : '0.0.0';

      const result = await systemBridge.initUpdater({
        serverUrl: 'http://192.168.3.18:8080',
        currentVersion: currentVersion || '0.0.0',
        forceDevUpdateConfig: true,
        autoDownload: false,
        autoInstallOnAppQuit: true,
      });

      if (result.success) {
        message.success('更新器初始化成功');
      } else {
        message.error('更新器初始化失败: ' + result.error);
      }
    } catch (error) {
      console.error('Error initializing updater:', error);
      message.error('更新器初始化异常');
    } finally {
      setLoading(false);
    }
  };

  const checkForUpdates = async () => {
    try {
      setLoading(true);
      const result = await systemBridge.checkForUpdates();
      if (result.success && result.data) {
        const updateData = result.data as UpdateInfo;
        setUpdateInfo(updateData);
        if (updateData.needUpdate) {
          message.success('检查更新完成：发现新版本 ' + updateData.version);
        } else {
          message.success('检查更新完成：已是最新版本');
        }
      } else {
        const errorMsg = result.error || '未知错误';
        message.error('检查更新失败: ' + errorMsg);
        setErrorInfo('检查更新失败: ' + errorMsg);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      const errorMsg = '检查更新异常: ' + String(error);
      message.error('检查更新异常');
      setErrorInfo(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const downloadUpdate = async () => {
    try {
      setLoading(true);
      const result = await systemBridge.downloadUpdate();
      if (result.success) {
        message.success('更新下载已开始');
        setErrorInfo('');
        setLoading(false);
      } else {
        const errorMsg = '下载更新失败: ' + result.error;
        message.error(errorMsg);
        setErrorInfo(errorMsg);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error downloading update:', error);
      const errorMsg = '下载更新异常: ' + String(error);
      message.error('下载更新异常');
      setErrorInfo(errorMsg);
      setLoading(false);
    }
  };

  const installUpdate = async () => {
    try {
      const result = await systemBridge.installUpdate();
      if (result.success) {
        message.success('更新安装已开始，应用将重启');
      } else {
        message.error('安装更新失败: ' + result.error);
      }
    } catch (error) {
      console.error('Error installing update:', error);
      message.error('安装更新异常');
    }
  };

  const getCurrentStep = () => {
    if (!updateInfo) return 0;
    if (updateInfo.needUpdate) {
      if (updateProgress?.type === 'downloaded') return 3;
      if (updateProgress?.type === 'download') return 2;
      return 1;
    }
    return 0;
  };



  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh',
      paddingBottom: '50px'
    }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <Space>
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={() => window.location.hash = '/'}
              >
                返回首页
              </Button>
              <Divider type="vertical" />
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
              <Descriptions column={1} size="small">
                <Descriptions.Item label="操作系统">{systemInfo.platform}</Descriptions.Item>
                <Descriptions.Item label="用户目录">{systemInfo.homedir}</Descriptions.Item>
                <Descriptions.Item label="系统架构">{systemInfo.arch}</Descriptions.Item>
                <Descriptions.Item label="Node.js 版本">{systemInfo.nodeVersion}</Descriptions.Item>
                <Descriptions.Item label="Electron 版本">{systemInfo.electronVersion}</Descriptions.Item>
                <Descriptions.Item label="Chrome 版本">{systemInfo.chromeVersion}</Descriptions.Item>
              </Descriptions>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">正在加载系统信息...</Text>
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
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Steps current={getCurrentStep()} size="small">
                <Step title="初始化" icon={<SettingOutlined />} />
                <Step title="检查更新" icon={<SyncOutlined />} />
                <Step title="下载更新" icon={<DownloadOutlined />} />
                <Step title="安装更新" icon={<CheckCircleOutlined />} />
              </Steps>

              <Space wrap>
                <Button
                  type="primary"
                  icon={<SettingOutlined />}
                  onClick={initUpdater}
                  loading={loading}
                >
                  初始化更新器
                </Button>
                <Button
                  icon={<SyncOutlined />}
                  onClick={checkForUpdates}
                  loading={loading}
                >
                  检查更新
                </Button>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={downloadUpdate}
                  loading={loading}
                  disabled={!updateInfo?.needUpdate}
                >
                  下载更新
                </Button>
                <Button
                  icon={<CheckCircleOutlined />}
                  onClick={installUpdate}
                  loading={loading}
                >
                  安装更新
                </Button>
                <Button
                  icon={<BugOutlined />}
                  type="dashed"
                  onClick={() => {
                    const status = JSON.stringify({ updateInfo, updateProgress }, null, 2);
                    console.log('当前更新状态:', { updateInfo, updateProgress });
                    setStatusInfo(status);
                  }}
                >
                  调试状态
                </Button>
              </Space>

              {updateInfo && (
                <Alert
                  message="更新信息"
                  description={
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>更新状态: </Text>
                        <Tag color={updateInfo.needUpdate ? 'orange' : 'green'}>
                          {updateInfo.needUpdate ? '有新版本可用' : '已是最新版本'}
                        </Tag>
                      </div>
                      <div>
                        <Text strong>版本号: </Text>
                        <Text code>{updateInfo.version}</Text>
                      </div>
                    </Space>
                  }
                  type={updateInfo.needUpdate ? 'warning' : 'success'}
                  showIcon
                />
              )}

                             {updateProgress && (
                 <Card size="small" style={{ backgroundColor: '#f6ffed' }}>
                   <Space direction="vertical" style={{ width: '100%' }}>
                     <div>
                       <Text strong>更新进度: </Text>
                       <Tag color="processing">{updateProgress.type}</Tag>
                     </div>

                     <Progress
                       percent={Math.round(updateProgress.progress.percent)}
                       status={updateProgress.type === 'downloaded' ? 'success' : 'active'}
                       strokeColor={{
                         '0%': '#108ee9',
                         '100%': '#87d068',
                       }}
                     />

                     {updateProgress.progress.total > 0 && (
                       <div>
                         <Text type="secondary">
                           下载进度: {(updateProgress.progress.transferred / 1024 / 1024).toFixed(2)} MB /
                           {(updateProgress.progress.total / 1024 / 1024).toFixed(2)} MB
                         </Text>
                       </div>
                     )}
                   </Space>
                 </Card>
               )}

               {errorInfo && (
                 <Alert
                   message="错误信息"
                   description={errorInfo}
                   type="error"
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
                     size="small" 
                     type="text" 
                     onClick={() => setStatusInfo('')}
                   >
                     清除
                   </Button>
                 </Space>
               }
               size="small"
             >
               <div style={{
                 backgroundColor: '#fafafa',
                 border: '1px solid #d9d9d9',
                 borderRadius: '6px',
                 maxHeight: '300px',
                 minHeight: '200px',
                 overflow: 'auto',
                 overflowY: 'scroll'
               }}>
                 <pre style={{
                   margin: 0,
                   padding: '16px',
                   fontSize: '12px',
                   fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                   whiteSpace: 'pre-wrap',
                   wordBreak: 'break-word',
                   lineHeight: '1.5',
                   color: '#2f3349'
                 }}>
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