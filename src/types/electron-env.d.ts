/// <reference types="vite-electron-plugin/electron-env" />
import {
  SystemInfo,
  SystemOperations,
  WindowOperations,
  DialogOperations,
  FileOperations,
  EventOperations,
  UdpOperations,
  WebSocketOperations,
} from '@/types/ipc';

declare namespace NodeJS {
  interface ProcessEnv {
    DIST: string;
    VITE_PUBLIC: string;
  }
}
declare global {
  interface Window {
    ipcRenderer: import('electron').IpcRenderer &
      SystemInfo &
      SystemOperations &
      WindowOperations &
      DialogOperations &
      FileOperations &
      EventOperations &
      UdpOperations &
      WebSocketOperations;
  }
}
