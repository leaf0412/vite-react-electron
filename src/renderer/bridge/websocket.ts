const ipcRenderer = window.ipcRenderer;

export const createAndBindWebSocket = (port: number) => {
  return ipcRenderer.createAndBindWebSocket(port);
};

export const destroyWebSocket = () => {
  return ipcRenderer.destroyWebSocket();
};

export const stopWebSocket = (port: number) => {
  return ipcRenderer.stopWebSocket(port);
};

export const sendWebSocket = (message: string, port: number) => {
  return ipcRenderer.sendWebSocket(message, port);
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
