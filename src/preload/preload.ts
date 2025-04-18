import { ipcRenderer, contextBridge } from 'electron';
import { appApi, dialogApi, fileApi, windowApi, udpApi } from '@preload/core';

const systemApi = {
  platform: process.platform,
  homedir: process.env.HOME || process.env.USERPROFILE || '',
};

const ipcApi = {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
};

contextBridge.exposeInMainWorld('ipcRenderer', {
  ...systemApi,
  ...ipcApi,
  ...windowApi,
  ...dialogApi,
  ...fileApi,
  ...appApi,
  ...udpApi,
});
