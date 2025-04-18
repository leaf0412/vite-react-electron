export type ListenerType = 'once' | 'on' | 'off';

export type IpcRendererEventCallback<T = void> = T extends void
  ? (event: Electron.IpcRendererEvent) => void
  : (event: Electron.IpcRendererEvent, ...args: T[]) => void;

export interface EventOperations {
  startupLoadingProgress(status: ListenerType, callback: IpcRendererEventCallback<number>): void;
  mainWindowReady(): void;
  getLanguage(): Promise<string>;
  checkForUpdates(): Promise<UpdateInfo>;
  downloadUpdate(): Promise<UpdateInfo>;
  installUpdate(): Promise<void>;
  upgradeProgress(status: ListenerType, callback: IpcRendererEventCallback<number>): void;
} 