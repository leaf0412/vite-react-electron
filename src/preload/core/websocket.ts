import { ipcRenderer } from 'electron';
import { Events } from '@main/ipc/ipc-events';

export const websocketApi = {
  createAndBindWebSocket: (port: number) =>
    ipcRenderer.invoke(Events.CREATE_AND_BIND_WEBSOCKET, port),
  destroyWebSocket: () => ipcRenderer.invoke(Events.DESTROY_WEBSOCKET),
  stopWebSocket: (port: number) => ipcRenderer.invoke(Events.STOP_WEBSOCKET, port),
  sendWebSocket: (message: string, port: number) =>
    ipcRenderer.invoke(Events.SEND_WEBSOCKET, message, port),
  getMessagesWebSocket: () => ipcRenderer.invoke(Events.GET_MESSAGES_WEBSOCKET),
  clearMessagesWebSocket: () => ipcRenderer.invoke(Events.CLEAR_MESSAGES_WEBSOCKET),
  isPortRunningWebSocket: (port: number) =>
    ipcRenderer.invoke(Events.IS_PORT_RUNNING_WEBSOCKET, port),
  getRunningPortsWebSocket: () => ipcRenderer.invoke(Events.GET_RUNNING_PORTS_WEBSOCKET),
  setMaxMessagesWebSocket: (maxMessages: number) =>
    ipcRenderer.invoke(Events.SET_MAX_MESSAGES_WEBSOCKET, maxMessages),
};
