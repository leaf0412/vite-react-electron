export const WindowEvents = {
  WINDOW_NEW: 'WINDOW_NEW',
  WINDOW_CLOSED: 'WINDOW_CLOSED',
  WINDOW_HIDE: 'WINDOW_HIDE',
  WINDOW_SHOW: 'WINDOW_SHOW',
  WINDOW_FOCUS: 'WINDOW_FOCUS',
  GET_WINDOW_INFO: 'GET_WINDOW_INFO',
  WINDOW_MINI: 'WINDOW_MINI',
  WINDOW_MAX: 'WINDOW_MAX',
  WINDOW_MAX_MIN_SIZE: 'WINDOW_MAX_MIN_SIZE',
  WINDOW_RESTORE: 'WINDOW_RESTORE',
  WINDOW_RELOAD: 'WINDOW_RELOAD',
  SCREEN_GET_DISPLAY_INFO: 'SCREEN_GET_DISPLAY_INFO',
} as const;

export const DialogEvents = {
  DIALOG_OPEN: 'DIALOG_OPEN',
  DIALOG_SAVE: 'DIALOG_SAVE',
  DIALOG_MESSAGE: 'DIALOG_MESSAGE',
  DIALOG_ERROR: 'DIALOG_ERROR',
  DIALOG_INFO: 'DIALOG_INFO',
  DIALOG_WARNING: 'DIALOG_WARNING',
  DIALOG_QUESTION: 'DIALOG_QUESTION',
} as const;

export const FileManagerEvents = {
  FILE_READ_DIRECTORY: 'FILE_READ_DIRECTORY',
  FILE_CREATE_DIRECTORY: 'FILE_CREATE_DIRECTORY',
  FILE_CREATE_FILE: 'FILE_CREATE_FILE',
  FILE_READ: 'FILE_READ',
  FILE_COPY: 'FILE_COPY',
  FILE_MOVE: 'FILE_MOVE',
  FILE_DELETE: 'FILE_DELETE',
  FILE_GET_INFO: 'FILE_GET_INFO',
  FILE_EXISTS: 'FILE_EXISTS',
} as const;

export const CommandEvents = {
  STARTUP_LOADING_PROGRESS: 'STARTUP_LOADING_PROGRESS',
  MAIN_WINDOW_READY: 'MAIN_WINDOW_READY',
  GET_LANGUAGE: 'GET_LANGUAGE',
} as const;

export const UpgradeEvents = {
  CHECK_FOR_UPDATES: 'CHECK_FOR_UPDATES',
  DOWNLOAD_UPDATE: 'SOFTWARE_DOWNLOAD_UPDATE',
  INSTALL_UPDATE: 'SOFTWARE_INSTALL_UPDATE',
  UPGRADE_PROGRESS: 'UPGRADE_PROGRESS',
} as const;

export type WindowEventKeys = keyof typeof WindowEvents;
export type DialogEventKeys = keyof typeof DialogEvents;
export type FileManagerEventKeys = keyof typeof FileManagerEvents;
export type UpgradeEventKeys = keyof typeof UpgradeEvents;
export const Events = {
  ...CommandEvents,
  ...WindowEvents,
  ...DialogEvents,
  ...FileManagerEvents,
  ...UpgradeEvents,
} as const;

export type EventKeys = keyof typeof Events;
