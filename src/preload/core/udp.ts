import { ipcRenderer } from 'electron';
import { Events } from '@main/ipc/ipc-events';

export const udpApi = {
  createAndBindUdp: (
    port: number,
    options?: { broadcast?: boolean; multicastAddr?: string }
  ) => {
    return ipcRenderer.invoke(Events.CREATE_AND_BIND_UDP, port, options);
  },
  destroyUdp: () => {
    return ipcRenderer.invoke(Events.DESTROY_UDP);
  },
  stopUdp: (port: number) => {
    return ipcRenderer.invoke(Events.STOP_UDP, port);
  },
  sendUdp: (message: string, address: string, port: number) => {
    return ipcRenderer.invoke(Events.SEND_UDP, message, address, port);
  },
  getMessagesUdp: () => {
    return ipcRenderer.invoke(Events.GET_MESSAGES_UDP);
  },
  clearMessagesUdp: () => {
    return ipcRenderer.invoke(Events.CLEAR_MESSAGES_UDP);
  },
  isPortRunningUdp: (port: number) => {
    return ipcRenderer.invoke(Events.IS_PORT_RUNNING_UDP, port);
  },
  getRunningPortsUdp: () => {
    return ipcRenderer.invoke(Events.GET_RUNNING_PORTS_UDP);
  },
  setMaxMessagesUdp: (maxMessages: number) => {
    return ipcRenderer.invoke(Events.SET_MAX_MESSAGES_UDP, maxMessages);
  },
};
