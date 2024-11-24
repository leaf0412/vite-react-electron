export const WindowEvents = {
  WINDOW_NEW: 'WINDOW_NEW',
  WINDOW_CLOSED: 'WINDOW_CLOSED',
  WINDOW_HIDE: 'WINDOW_HIDE',
  WINDOW_SHOW: 'WINDOW_SHOW',
  WINDOW_FOCUS: 'WINDOW_FOCUS',
  WINDOW_ID: 'WINDOW_ID',
  WINDOW_MINI: 'WINDOW_MINI',
  WINDOW_MAX: 'WINDOW_MAX',
  WINDOW_MAX_MIN_SIZE: 'WINDOW_MAX_MIN_SIZE',
  WINDOW_RESTORE: 'WINDOW_RESTORE',
  WINDOW_RELOAD: 'WINDOW_RELOAD',
  WINDOW_GET_BOUNDS: 'WINDOW_GET_BOUNDS',
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

export type WindowEventKeys = keyof typeof WindowEvents;
export type DialogEventKeys = keyof typeof DialogEvents;
export type FileManagerEventKeys = keyof typeof FileManagerEvents;

export const Events = {
  ...WindowEvents,
  ...DialogEvents,
  ...FileManagerEvents,
} as const;

export type EventKeys = keyof typeof Events;
