import { ipcRenderer } from 'electron';
import { ListenerType } from '@/types/ipc/events';

export const handleEvent = (
  status: ListenerType,
  channel: string,
  callback: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void
) => {
  const wrappedCallback = (
    event: Electron.IpcRendererEvent,
    ...args: unknown[]
  ) => callback(event, ...args);
  if (status === 'once') return ipcRenderer.once(channel, wrappedCallback);
  if (status === 'on') return ipcRenderer.on(channel, wrappedCallback);
  if (status === 'off') return ipcRenderer.off(channel, wrappedCallback);
};
