import { app } from 'electron';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

export const isWindows = process.platform === 'win32';
export const isMac = process.platform === 'darwin';
export const isLinux = process.platform === 'linux';

export const isDevelopment = process.env.NODE_ENV === 'development';

export const appStaticPath = isDevelopment
  ? join(app.getAppPath(), 'static')
  : join(process.resourcesPath, 'static');

export const __dirname = dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = join(__dirname, '..');

export const RENDERER_DIRECTORY_NAME = 'dist';
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = join(
  process.env.APP_ROOT,
  RENDERER_DIRECTORY_NAME
);

export const VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;
