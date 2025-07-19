import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Select, Flex, Divider } from 'antd';
import { LanguageType } from '@renderer/i18n';

import {
  createAndBindUdp,
  getMessagesUdp,
  destroyUdp,
  createAndBindWebSocket,
  destroyWebSocket,
  isPortRunningUdp,
  isPortRunningWebSocket,
} from '@/renderer/bridge';

const { Option } = Select;

function Home() {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  useEffect(() => {
    const currentLanguage =
      window.localStorage.getItem('lang') ?? LanguageType.EN_US;
    setLanguage(currentLanguage);

    // udp - 检查端口是否已经在使用，避免重复绑定
    isPortRunningUdp(8443).then(response => {
      if (response.success && !response.data) {
        createAndBindUdp(8443).then(result => {
          if (result.success) {
            console.log('createAndBindUdp success:', result.data);
          } else {
            console.error('createAndBindUdp failed:', result.error);
          }
        });
      } else if (response.success && response.data) {
        console.log('UDP port 8443 is already running');
      } else {
        console.error('Failed to check UDP port status:', response.error);
      }
    });

    // websocket - 检查端口是否已经在使用，避免重复绑定
    isPortRunningWebSocket(8099).then(response => {
      if (response.success && !response.data) {
        createAndBindWebSocket(8099).then(result => {
          if (result.success) {
            console.log('createAndBindWebSocket success:', result.data);
          } else {
            console.error('createAndBindWebSocket failed:', result.error);
          }
        });
      } else if (response.success && response.data) {
        console.log('WebSocket port 8099 is already running');
      } else {
        console.error('Failed to check WebSocket port status:', response.error);
      }
    });

    const interval = setInterval(() => {
      getMessagesUdp<{
        data: {
          key: string;
        };
      }>().then(response => {
        if (response.success && response.data) {
          const seen = new Set();
          const uniqueMessages = response.data.filter(message => {
            const key = JSON.stringify(message.raw);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          const uniqueMessagesString = uniqueMessages.map(message => {
            return message.parsed.data;
          });
          console.log('getMessagesUdp', uniqueMessagesString);
        } else if (!response.success) {
          console.error('Failed to get UDP messages:', response.error);
        }
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



  return (
    <div className='container'>
      <h1 style={{ textAlign: 'center' }}>{t('home.welcome')}</h1>
      <Divider style={{ borderColor: '#7cb305' }}></Divider>
      <Flex align='center' justify='space-around'>
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
        <Link to='/system'>系统信息</Link>
      </Flex>
    </div>
  );
}

export default Home;
