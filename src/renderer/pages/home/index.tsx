import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Select, Badge, Flex, Button, Space, Divider, message } from 'antd';
import { NotificationOutlined } from '@ant-design/icons';
import { LanguageType } from '@renderer/i18n';
import {
  checkForUpdates,
  downloadUpdate,
  upgradeProgress,
} from '@/renderer/bridge';
import { IpcRendererEventCallback } from '@/types/ipc/events';
import {
  createAndBindUdp,
  getMessagesUdp,
  destroyUdp,
  createAndBindWebSocket,
  destroyWebSocket,
} from '@/renderer/bridge';

const { Option } = Select;

type UpdateInfo = {
  status: boolean;
  needUpdate: boolean;
  version: string;
};

function Home() {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    const currentLanguage =
      window.localStorage.getItem('lang') ?? LanguageType.EN_US;
    setLanguage(currentLanguage);

    checkForUpdates().then(result => {
      setUpdateInfo(result);
    });

    const handleUpgradeProgress: IpcRendererEventCallback<number> = (
      _event,
      progress
    ) => {
      console.log('upgradeProgress', progress);
    };

    upgradeProgress('on', handleUpgradeProgress);

    // udp
    createAndBindUdp(8443).then(result => {
      console.log('createAndBindUdp', result);
    });

    // websocket
    createAndBindWebSocket(8099).then(result => {
      console.log('createAndBindWebSocket', result);
    });

    const interval = setInterval(() => {
      getMessagesUdp<{
        data: {
          key: string;
        };
      }>().then(result => {
        const seen = new Set();
        const uniqueMessages = result.filter(message => {
          const key = JSON.stringify(message.raw);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        const uniqueMessagesString = uniqueMessages.map(message => {
          return message.parsed.data;
        });
        console.log('getMessagesUdp', uniqueMessagesString);
      });
    }, 3000);

    return () => {
      clearInterval(interval);
      destroyUdp();
      destroyWebSocket();
    };
  }, []);

  const changeLanguage = useCallback(
    (value: string) => {
      window.localStorage.setItem('lang', value);
      setLanguage(value);
      i18n.changeLanguage(value);
    },
    [i18n]
  );

  const handleDownloadUpdate = useCallback(() => {
    downloadUpdate().then(result => {
      console.log('downloadUpdate', result);
      if (result?.status) {
        message.success(t('home.updateSuccess'));
      } else {
        message.error(t('home.updateError'));
      }
    });
  }, [t]);

  return (
    <div className='container'>
      <h1 style={{ textAlign: 'center' }}>{t('home.welcome')}</h1>
      <Divider style={{ borderColor: '#7cb305' }}></Divider>
      <Flex align='center' justify='space-around'>
        <Space>
          <Badge dot={updateInfo?.needUpdate}>
            <NotificationOutlined />
          </Badge>
          <Button onClick={handleDownloadUpdate}>{t('home.update')}</Button>
        </Space>
        <Select value={language} onChange={changeLanguage}>
          {Object.entries(LanguageType).map(([key, value]) => {
            return (
              <Option key={key} value={value}>
                {value}
              </Option>
            );
          })}
        </Select>
      </Flex>
      <Divider style={{ borderColor: '#7cb305' }}></Divider>

      <Flex align='center' justify='space-around'>
        <Link to='/window'>{t('home.window')}</Link>
        <Link to='/dialog'>{t('home.dialog')}</Link>
        <Link to='/file-manager'>{t('home.fileManager')}</Link>
      </Flex>
    </div>
  );
}

export default Home;
