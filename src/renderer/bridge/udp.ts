const ipcRenderer = window.ipcRenderer;

export const createAndBindUdp = (
  port: number,
  options?: { broadcast?: boolean; multicastAddr?: string }
) => ipcRenderer.createAndBindUdp(port, options);

export const destroyUdp = () => ipcRenderer.destroyUdp();

export const stopUdp = (port: number) => ipcRenderer.stopUdp(port);

export const sendUdp = (message: string, address: string, port: number) =>
  ipcRenderer.sendUdp(message, address, port);

export const getMessagesUdp = <T>() => ipcRenderer.getMessagesUdp<T>();

export const clearMessagesUdp = () => ipcRenderer.clearMessagesUdp();

export const isPortRunningUdp = (port: number) =>
  ipcRenderer.isPortRunningUdp(port);

export const getRunningPortsUdp = () => ipcRenderer.getRunningPortsUdp();

export const setMaxMessagesUdp = (maxMessages: number) =>
  ipcRenderer.setMaxMessagesUdp(maxMessages);
