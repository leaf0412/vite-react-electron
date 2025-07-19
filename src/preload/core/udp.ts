import { ipcRenderer } from 'electron';
import { Events } from '@main/shared/constants';

export const udpApi = {
  createAndBindUdp: (
    port: number,
    options?: { broadcast?: boolean; multicastAddr?: string }
  ) => {
    return ipcRenderer.invoke(Events.UDP_CREATE, port, options);
  },
  destroyUdp: () => {
    return ipcRenderer.invoke(Events.UDP_DESTROY);
  },
  stopUdp: (port: number) => {
    return ipcRenderer.invoke(Events.UDP_STOP, port);
  },
  sendUdp: (message: string, address: string, port: number) => {
    return ipcRenderer.invoke(Events.UDP_SEND, message, address, port);
  },
  getMessagesUdp: () => {
    return ipcRenderer.invoke(Events.UDP_GET_MESSAGES);
  },
  clearMessagesUdp: () => {
    return ipcRenderer.invoke(Events.UDP_CLEAR_MESSAGES);
  },
  isPortRunningUdp: (port: number) => {
    return ipcRenderer.invoke(Events.UDP_IS_PORT_RUNNING, port);
  },
  getRunningPortsUdp: () => {
    return ipcRenderer.invoke(Events.UDP_GET_RUNNING_PORTS);
  },
  setMaxMessagesUdp: (maxMessages: number) => {
    return ipcRenderer.invoke(Events.UDP_SET_MAX_MESSAGES, maxMessages);
  },
};
