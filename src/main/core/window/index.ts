import { app, BrowserWindow } from 'electron';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  RENDERER_DIRECTORY_NAME,
  VITE_DEV_SERVER_URL,
  VITE_PUBLIC,
} from '@main/constants';
import { createProtocol, defaultScheme } from '@main/core/protocol';
import { WindowOptions } from '@/types/ipc/window';

const __dirname = dirname(fileURLToPath(import.meta.url));

class WindowManager {
  rendererDirectoryName = RENDERER_DIRECTORY_NAME;
  windowOptionsConfig = {};
  main: BrowserWindow | null = null;
  group = new Map();
  constructor(
    props: {
      rendererDirectoryName?: string;
    } = {}
  ) {
    this.windowOptionsConfig = this.windowOptions();
    this.rendererDirectoryName =
      props.rendererDirectoryName || this.rendererDirectoryName;
    createProtocol({
      scheme: defaultScheme,
      directory: {
        isSameDirectory: true,
        name: this.rendererDirectoryName,
      },
    });
  }

  windowOptions(width = 500, height = 800) {
    return {
      width,
      height,
      isDevTools: false,
      resizable: true,
      minimizable: true,
      maximizable: true,
      show: false,
      icon: join(VITE_PUBLIC, 'icon.png'),
      webPreferences: {
        preload: join(__dirname, 'preload.mjs'),
        webSecurity: false,
        contextIsolation: true,
        nodeIntegration: true,
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
      if (args.isDevTools) {
        win.webContents.openDevTools();
      }
    } else {
      const filePath = `./${this.rendererDirectoryName}`;
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
}

export default WindowManager;
