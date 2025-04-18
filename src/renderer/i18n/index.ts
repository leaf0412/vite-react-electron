import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import cn from '@shared/i18n/zh.json';
import en from '@shared/i18n/en.json';

export enum LanguageType {
  ZH_CN = 'zh-CN',
  EN_US = 'en-US',
}

export const resources = {
  [LanguageType.ZH_CN]: {
    translation: cn,
  },
  [LanguageType.EN_US]: {
    translation: en,
  },
};

i18next.use(initReactI18next).init({
  resources,
  lng: LanguageType.ZH_CN,
  detection: {
    caches: ['localStorage'],
  },
});

export default i18next;
