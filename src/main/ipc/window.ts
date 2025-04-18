import { ipcMain, BrowserWindow, screen } from 'electron';
import { WindowEvents } from '@/main/ipc/ipc-events';
import { WindowInfo, WindowInfoParams } from '@/types/ipc/window';
import WindowManager from '@main/core/window-manager';

type ParamToInfoMap = {
  isBounds: 'bounds';
  isMaximized: 'isMaximized';
  isMinimized: 'isMinimized';
  isFullScreen: 'isFullScreen';
  isVisible: 'isVisible';
  isDestroyed: 'isDestroyed';
  isFocused: 'isFocused';
  isAlwaysOnTop: 'isAlwaysOnTop';
};

type ParamKey = keyof ParamToInfoMap;

class WindowIpcHandler {
  private windowManager: WindowManager;

  constructor(windowManager: WindowManager) {
    this.windowManager = windowManager;
  }

  private paramToInfoKey = <K extends ParamKey>(key: K): ParamToInfoMap[K] => {
    const map: ParamToInfoMap = {
      isBounds: 'bounds',
      isMaximized: 'isMaximized',
      isMinimized: 'isMinimized',
      isFullScreen: 'isFullScreen',
      isVisible: 'isVisible',
      isDestroyed: 'isDestroyed',
      isFocused: 'isFocused',
      isAlwaysOnTop: 'isAlwaysOnTop',
    };
    return map[key];
  };

  private assignTyped = <T, K extends keyof T>(
    target: T,
    key: K,
    value: T[K]
  ) => {
    target[key] = value;
  };

  initIpcHandlers() {
    ipcMain.handle(WindowEvents.WINDOW_CLOSED, (_event, winId) => {
      if (winId) {
        this.windowManager.getWindow(Number(winId))?.close();
        this.windowManager['group'].delete(winId);
      } else {
        this.windowManager.closeAllWindow();
      }
    });

    ipcMain.handle(WindowEvents.WINDOW_HIDE, (_event, winId) => {
      if (winId) {
        this.windowManager.getWindow(Number(winId))?.hide();
      } else {
        for (const i in this.windowManager['group'])
          if (this.windowManager['group'].get(i))
            this.windowManager.getWindow(Number(i))?.hide();
      }
    });

    ipcMain.handle(WindowEvents.WINDOW_SHOW, (_event, winId) => {
      if (winId) {
        this.windowManager.getWindow(Number(winId))?.show();
      } else {
        for (const i in this.windowManager['group'])
          if (this.windowManager['group'].get(i))
            this.windowManager.getWindow(Number(i))?.show();
      }
    });

    ipcMain.handle(WindowEvents.WINDOW_MINI, (_event, winId) => {
      if (winId) {
        this.windowManager.getWindow(Number(winId))?.minimize();
      } else {
        for (const i in this.windowManager['group'])
          if (this.windowManager['group'].get(i))
            this.windowManager.getWindow(Number(i))?.minimize();
      }
    });

    ipcMain.handle(WindowEvents.WINDOW_MAX, (_event, winId) => {
      if (winId) {
        this.windowManager.getWindow(Number(winId))?.maximize();
      } else {
        for (const i in this.windowManager['group'])
          if (this.windowManager['group'].get(i))
            this.windowManager.getWindow(Number(i))?.maximize();
      }
    });

    ipcMain.handle(WindowEvents.WINDOW_MAX_MIN_SIZE, (_event, winId) => {
      if (winId) {
        if (this.windowManager.getWindow(winId)?.isMaximized()) {
          this.windowManager.getWindow(winId)?.unmaximize();
        } else {
          this.windowManager.getWindow(winId)?.maximize();
        }
      }
    });

    ipcMain.handle(WindowEvents.WINDOW_RESTORE, (_event, winId) => {
      if (winId) {
        this.windowManager.getWindow(Number(winId))?.restore();
      } else {
        for (const i in this.windowManager['group'])
          if (this.windowManager['group'].get(i))
            this.windowManager.getWindow(Number(i))?.restore();
      }
    });

    ipcMain.handle(WindowEvents.WINDOW_RELOAD, (_event, winId) => {
      if (winId) {
        this.windowManager.getWindow(Number(winId))?.reload();
      } else {
        for (const i in this.windowManager['group'])
          if (this.windowManager['group'].get(i))
            this.windowManager.getWindow(Number(i))?.reload();
      }
    });

    ipcMain.handle(WindowEvents.WINDOW_FOCUS, (_event, winId) => {
      if (winId) {
        this.windowManager.getWindow(Number(winId))?.focus();
      }
    });

    ipcMain.handle(
      WindowEvents.GET_WINDOW_INFO,
      (_event, params: WindowInfoParams = {}): WindowInfo => {
        const win = BrowserWindow.fromWebContents(_event.sender);
        if (!win) {
          throw new Error('Window not found');
        }

        const baseInfo: WindowInfo = {
          id: win.id,
          title: win.title,
          url: win.webContents.getURL(),
        };

        const extractors: Record<
          ParamKey,
          () => WindowInfo[ParamToInfoMap[ParamKey]]
        > = {
          isBounds: () => win.getBounds(),
          isMaximized: () => win.isMaximized(),
          isMinimized: () => win.isMinimized(),
          isFullScreen: () => win.isFullScreen(),
          isVisible: () => win.isVisible(),
          isDestroyed: () => win.isDestroyed(),
          isFocused: () => win.isFocused(),
          isAlwaysOnTop: () => win.isAlwaysOnTop(),
        };

        (Object.keys(params) as ParamKey[]).forEach(paramKey => {
          if (params[paramKey]) {
            const infoKey = this.paramToInfoKey(paramKey);
            this.assignTyped(baseInfo, infoKey, extractors[paramKey]());
          }
        });
        return baseInfo;
      }
    );

    ipcMain.handle(WindowEvents.WINDOW_NEW, (_event, args) => {
      const win = this.windowManager.createWindow(args);
      return win.id;
    });

    ipcMain.handle(WindowEvents.SCREEN_GET_DISPLAY_INFO, () => {
      const display = screen.getPrimaryDisplay();
      return display;
    });
  }

  destroyIpcHandlers() {
    Object.keys(WindowEvents).forEach(key => {
      ipcMain.removeHandler(WindowEvents[key as keyof typeof WindowEvents]);
    });
  }
}

export default WindowIpcHandler;
