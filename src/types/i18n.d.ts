import zh from '@shared/i18n/zh.json';

const resources = { translation: zh } as const;

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: typeof resources;
    strictMode: true;
    returnNull: false;
    returnEmptyString: false;
    returnObjects: false;
  }
}
