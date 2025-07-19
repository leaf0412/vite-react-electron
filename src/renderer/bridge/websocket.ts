const ipcRenderer = window.ipcRenderer;

export const createAndBindWebSocket = (port: number, options?: { path?: string }) => {
  return ipcRenderer.createAndBindWebSocket(port, options);
};

export const destroyWebSocket = () => {
  return ipcRenderer.destroyWebSocket();
};

export const stopWebSocket = (port: number) => {
  return ipcRenderer.stopWebSocket(port);
};

export const sendWebSocket = (message: string | Buffer, clientId: string, port: number) => {
  return ipcRenderer.sendWebSocket(message, clientId, port);
};

export const sendToAllWebSocket = (message: string | Buffer, port: number) => {
  return ipcRenderer.sendToAllWebSocket(message, port);
};

export const getMessagesWebSocket = <T>() => {
  return ipcRenderer.getMessagesWebSocket<T>();
};

export const clearMessagesWebSocket = () => {
  return ipcRenderer.clearMessagesWebSocket();
};

export const isPortRunningWebSocket = (port: number) => {
  return ipcRenderer.isPortRunningWebSocket(port);
};

export const getRunningPortsWebSocket = () => {
  return ipcRenderer.getRunningPortsWebSocket();
};

export const setMaxMessagesWebSocket = (maxMessages: number) => {
  return ipcRenderer.setMaxMessagesWebSocket(maxMessages);
};
