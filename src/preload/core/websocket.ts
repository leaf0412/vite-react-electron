import { ipcRenderer } from 'electron';
import { Events } from '@main/shared/constants';

export const websocketApi = {
  createAndBindWebSocket: (port: number, options?: { path?: string }) =>
    ipcRenderer.invoke(Events.WEBSOCKET_CREATE, port, options),
  destroyWebSocket: () => ipcRenderer.invoke(Events.WEBSOCKET_DESTROY),
  stopWebSocket: (port: number) => ipcRenderer.invoke(Events.WEBSOCKET_STOP, port),
  sendWebSocket: (message: string | Buffer, clientId: string, port: number) =>
    ipcRenderer.invoke(Events.WEBSOCKET_SEND, message, clientId, port),
  sendToAllWebSocket: (message: string | Buffer, port: number) =>
    ipcRenderer.invoke(Events.WEBSOCKET_SEND_TO_ALL, message, port),
  getMessagesWebSocket: () => ipcRenderer.invoke(Events.WEBSOCKET_GET_MESSAGES),
  clearMessagesWebSocket: () => ipcRenderer.invoke(Events.WEBSOCKET_CLEAR_MESSAGES),
  isPortRunningWebSocket: (port: number) =>
    ipcRenderer.invoke(Events.WEBSOCKET_IS_PORT_RUNNING, port),
  getRunningPortsWebSocket: () => ipcRenderer.invoke(Events.WEBSOCKET_GET_RUNNING_PORTS),
  setMaxMessagesWebSocket: (maxMessages: number) =>
    ipcRenderer.invoke(Events.WEBSOCKET_SET_MAX_MESSAGES, maxMessages),
};
