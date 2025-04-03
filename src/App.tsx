import { HashRouter, Route, Routes } from 'react-router-dom';
// import { Provider } from 'react-redux';
import router from '@/router';
// import store from './store';
import './App.css';
import { useTranslation } from 'react-i18next';
import { useEffect, useCallback } from 'react';
import { LanguageType } from '@/i18n';

function AppContent() {
  const { i18n } = useTranslation();

  const changeLanguage = useCallback(
    (value: string) => {
      window.localStorage.setItem('lang', value);
      i18n.changeLanguage(value);
    },
    [i18n]
  );

  const getLanguage = useCallback(async () => {
    const softwareLanguage = await window.ipcRenderer?.getLanguage();
    const lang = window.localStorage.getItem('lang');
    let currentLanguage = lang ?? softwareLanguage;
    if (
      softwareLanguage !== LanguageType.ZH_CN &&
      lang !== LanguageType.ZH_CN
    ) {
      currentLanguage = LanguageType.EN_US;
    }
    changeLanguage(currentLanguage);
  }, [changeLanguage]);

  useEffect(() => {
    getLanguage();
  }, [getLanguage]);

  return (
    <Routes>
      {router.map((item, index) => {
        return (
          <Route key={index} path={item.path} element={<item.Component />} />
        );
      })}
    </Routes>
  );
}

function App() {
  return (
    // <Provider store={store}>
    <HashRouter>
      <AppContent />
    </HashRouter>
    // </Provider>
  );
}

export default App;
