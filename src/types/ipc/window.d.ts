export type WindowOptions = Electron.BrowserWindowConstructorOptions & {
  id?: number;
  route?: string;
  isMultiWindow?: boolean;
  isMainWin?: boolean;
  maximize?: boolean;
  parentId?: number;
  isDevTools?: boolean;
};

export interface WindowInfoParams {
  isBounds?: boolean;
  isMaximized?: boolean;
  isMinimized?: boolean;
  isFullScreen?: boolean;
  isVisible?: boolean;
  isDestroyed?: boolean;
  isFocused?: boolean;
  isAlwaysOnTop?: boolean;
}

export interface WindowInfo {
  id: number | undefined;
  title: string | undefined;
  url: string;
  bounds?: Electron.Rectangle;
  isMaximized?: boolean;
  isMinimized?: boolean;
  isFullScreen?: boolean;
  isVisible?: boolean;
  isDestroyed?: boolean;
  isFocused?: boolean;
  isAlwaysOnTop?: boolean;
}

export interface WindowOperations {
  newWindow(options?: WindowOptions): Promise<number>;
  closeWindow(winId?: number): Promise<void>;
  hideWindow(winId?: number): Promise<void>;
  showWindow(winId?: number): Promise<void>;
  focusWindow(winId?: number): Promise<void>;
  getWindowInfo(params?: WindowInfoParams): Promise<WindowInfo>;
  minimizeWindow(winId?: number): Promise<void>;
  maximizeWindow(winId?: number): Promise<void>;
  toggleMaximizeWindow(winId?: number): Promise<void>;
  restoreWindow(winId?: number): Promise<void>;
  reloadWindow(winId?: number): Promise<void>;
  getWindowBounds(): Promise<Electron.Rectangle>;
  getDisplayInfo(): Promise<Electron.Display[]>;
}

export type ParamToInfoMap = {
  isBounds: 'bounds';
  isMaximized: 'isMaximized';
  isMinimized: 'isMinimized';
  isFullScreen: 'isFullScreen';
  isVisible: 'isVisible';
  isDestroyed: 'isDestroyed';
  isFocused: 'isFocused';
  isAlwaysOnTop: 'isAlwaysOnTop';
};

export type ParamKey = keyof ParamToInfoMap;
