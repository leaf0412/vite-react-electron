/// <reference types="vite-electron-plugin/electron-env" />
import { SystemInfo } from './ipc/system';
import { WindowOperations } from './ipc/window';
import { DialogOperations } from './ipc/dialog';
import { FileOperations } from './ipc/file';
import { EventOperations } from './ipc/events';

declare namespace NodeJS {
  interface ProcessEnv {
    DIST: string
    VITE_PUBLIC: string
  }
}
declare global {
  interface Window {
    ipcRenderer: import('electron').IpcRenderer & SystemInfo & WindowOperations & DialogOperations & FileOperations & EventOperations;
  }
}
