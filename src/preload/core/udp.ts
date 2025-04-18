import { ipcRenderer } from 'electron';
import { Events } from '@main/ipc/ipc-events';

export const udpApi = {
  createAndBindUdp: (
    port: number,
    options?: { broadcast?: boolean; multicastAddr?: string }
  ) => {
    return ipcRenderer.invoke(Events.CREATE_AND_BIND, port, options);
  },
  destroyUdp: () => {
    return ipcRenderer.invoke(Events.DESTROY);
  },
  stopUdp: (port: number) => {
    return ipcRenderer.invoke(Events.STOP, port);
  },
  sendUdp: (message: string, address: string, port: number) => {
    return ipcRenderer.invoke(Events.SEND, message, address, port);
  },
  getMessagesUdp: () => {
    return ipcRenderer.invoke(Events.GET_MESSAGES);
  },
  clearMessagesUdp: () => {
    return ipcRenderer.invoke(Events.CLEAR_MESSAGES);
  },
  isPortRunningUdp: (port: number) => {
    return ipcRenderer.invoke(Events.IS_PORT_RUNNING, port);
  },
  getRunningPortsUdp: () => {
    return ipcRenderer.invoke(Events.GET_RUNNING_PORTS);
  },
  setMaxMessagesUdp: (maxMessages: number) => {
    return ipcRenderer.invoke(Events.SET_MAX_MESSAGES, maxMessages);
  },
};
