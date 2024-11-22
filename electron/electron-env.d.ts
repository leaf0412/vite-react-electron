/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

type WindowOptions = BrowserWindowConstructorOptions & {
  id?: number;
  isMainWin?: boolean;
  route?: string;
  isMultiWindow?: boolean;
  parentId?: number;
  maximize?: boolean;
};

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import('electron').IpcRenderer & {
    // Window operations
    newWindow(options?: WindowOptions): Promise<number>
    closeWindow(winId?: number): Promise<void>
    hideWindow(winId?: number): Promise<void>
    showWindow(winId?: number): Promise<void>
    focusWindow(winId?: number): Promise<void>
    getWindowId(): Promise<number>
    minimizeWindow(winId?: number): Promise<void>
    maximizeWindow(winId?: number): Promise<void>
    toggleMaximize(winId?: number): Promise<void>
    restoreWindow(winId?: number): Promise<void>
    reloadWindow(winId?: number): Promise<void>
    getWindowBounds(): Promise<{ x: number; y: number; width: number; height: number }>
    getDisplayInfo(): Promise<import('electron').Display>
  }
}
