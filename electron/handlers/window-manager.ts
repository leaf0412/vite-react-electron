import { app, BrowserWindow, ipcMain, screen } from 'electron';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import createProtocol, { defaultScheme } from './create-protocol';
import {
  RENDERER_DIRECTORY_NAME,
  VITE_DEV_SERVER_URL,
  VITE_PUBLIC,
} from '@electron/config/constant';
import { WindowEvents } from '@electron/config/ipc-events';

const __dirname = dirname(fileURLToPath(import.meta.url));

const Events = WindowEvents;

class WindowManager {
  rendererDirectoryName = RENDERER_DIRECTORY_NAME;
  windowOptionsConfig = {};
  main: BrowserWindow | null = null;
  group = new Map();
  constructor(props: { rendererDirectoryName?: string } = {}) {
    this.windowOptionsConfig = this.windowOptions();
    this.rendererDirectoryName =
      props.rendererDirectoryName || this.rendererDirectoryName;
    createProtocol();
  }

  windowOptions(width = 500, height = 800) {
    return {
      width,
      height,
      resizable: true,
      minimizable: true,
      maximizable: true,
      show: false,
      icon: join(VITE_PUBLIC, 'icon.png'),
      webPreferences: {
        preload: join(__dirname, 'preload.mjs'),
      },
    };
  }

  getWindow(id: number) {
    return BrowserWindow.fromId(id) || undefined;
  }

  getAllWindows() {
    return BrowserWindow.getAllWindows();
  }

  createWindow(options?: WindowOptions) {
    const opt = this.windowOptionsConfig;
    const args = Object.assign({}, opt, options);

    for (const i in this.group) {
      const currentWindow = this.getWindow(Number(i));
      const { route, isMultiWindow } = this.group.get(i);
      if (currentWindow && route === args.route && !isMultiWindow) {
        currentWindow.focus();
        return currentWindow;
      }
    }

    if (args.parentId) {
      args.parent = this.getWindow(args.parentId);
    }

    const win = new BrowserWindow(args);
    this.group.set(win.id, {
      route: args.route || '',
      isMultiWindow: args.isMultiWindow || false,
    });

    if (args.maximize && args.resizable) {
      win.maximize();
    }

    if (args.isMainWin) {
      if (this.main) {
        this.group.delete(this.main.id);
        this.main.close();
      }
      this.main = win;
    }
    args.id = win.id;

    let winURL = '';
    if (VITE_DEV_SERVER_URL) {
      winURL = args.route
        ? VITE_DEV_SERVER_URL + args.route
        : VITE_DEV_SERVER_URL;
    } else {
      const filePath = `./${this.rendererDirectoryName}/index.html`;
      winURL = args.route
        ? `${defaultScheme}://${filePath}${args.route}`
        : `${defaultScheme}://${filePath}`;
    }
    win.loadURL(winURL);

    win.on('close', () => win.setOpacity(0));
    return win;
  }

  closeAllWindow() {
    for (const i in this.group) {
      if (this.group.get(i)) {
        if (this.getWindow(Number(i))) {
          this.getWindow(Number(i))?.close();
        } else {
          app.quit();
        }
      }
    }
  }

  initIpcHandlers() {
    ipcMain.handle(Events.WINDOW_CLOSED, (_event, winId) => {
      if (winId) {
        this.getWindow(Number(winId))?.close();
        this.group.delete(winId);
      } else {
        this.closeAllWindow();
      }
    });

    ipcMain.handle(Events.WINDOW_HIDE, (_event, winId) => {
      if (winId) {
        this.getWindow(Number(winId))?.hide();
      } else {
        for (const i in this.group)
          if (this.group.get(i)) this.getWindow(Number(i))?.hide();
      }
    });

    ipcMain.handle(Events.WINDOW_SHOW, (_event, winId) => {
      if (winId) {
        this.getWindow(Number(winId))?.show();
      } else {
        for (const i in this.group)
          if (this.group.get(i)) this.getWindow(Number(i))?.show();
      }
    });

    ipcMain.handle(Events.WINDOW_MINI, (_event, winId) => {
      if (winId) {
        this.getWindow(Number(winId))?.minimize();
      } else {
        for (const i in this.group)
          if (this.group.get(i)) this.getWindow(Number(i))?.minimize();
      }
    });

    ipcMain.handle(Events.WINDOW_MAX, (_event, winId) => {
      if (winId) {
        this.getWindow(Number(winId))?.maximize();
      } else {
        for (const i in this.group)
          if (this.group.get(i)) this.getWindow(Number(i))?.maximize();
      }
    });

    ipcMain.handle(Events.WINDOW_MAX_MIN_SIZE, (_event, winId) => {
      if (winId) {
        if (this.getWindow(winId)?.isMaximized()) {
          this.getWindow(winId)?.unmaximize();
        } else {
          this.getWindow(winId)?.maximize();
        }
      }
    });

    ipcMain.handle(Events.WINDOW_RESTORE, (_event, winId) => {
      if (winId) {
        this.getWindow(Number(winId))?.restore();
      } else {
        for (const i in this.group)
          if (this.group.get(i)) this.getWindow(Number(i))?.restore();
      }
    });

    ipcMain.handle(Events.WINDOW_RELOAD, (_event, winId) => {
      if (winId) {
        this.getWindow(Number(winId))?.reload();
      } else {
        for (const i in this.group)
          if (this.group.get(i)) this.getWindow(Number(i))?.reload();
      }
    });

    ipcMain.handle(Events.WINDOW_FOCUS, (_event, winId) => {
      if (winId) {
        this.getWindow(Number(winId))?.focus();
      }
    });

    ipcMain.handle(Events.WINDOW_ID, _event => {
      return BrowserWindow.fromWebContents(_event.sender)?.id;
    });

    ipcMain.handle(Events.WINDOW_NEW, (_event, args) => {
      const win = this.createWindow(args);
      return win.id;
    });

    ipcMain.handle(Events.WINDOW_GET_BOUNDS, _event => {
      return BrowserWindow.fromWebContents(_event.sender)?.getBounds();
    });

    ipcMain.handle(Events.SCREEN_GET_DISPLAY_INFO, () => {
      const display = screen.getPrimaryDisplay();
      return display;
    });
  }

  destroyIpcHandlers() {
    Object.keys(Events).forEach(key => {
      ipcMain.removeHandler(Events[key as keyof typeof Events]);
    });
  }
}

export default WindowManager;
