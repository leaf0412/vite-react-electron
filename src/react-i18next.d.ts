import zhCN from '@/i18n/zh-cn.json';

const resources = { translation: zhCN } as const;

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: typeof resources;
  }
}
