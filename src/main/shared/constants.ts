export const Events = {
  // 窗口事件
  WINDOW_CREATE: 'window:create',
  WINDOW_CLOSE: 'window:close',
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_SHOW: 'window:show',
  WINDOW_HIDE: 'window:hide',

  // 文件事件
  FILE_READ_DIRECTORY: 'file:read-directory',
  FILE_CREATE_DIRECTORY: 'file:create-directory',
  FILE_CREATE_FILE: 'file:create-file',
  FILE_READ_FILE: 'file:read-file',
  FILE_COPY_FILE: 'file:copy-file',
  FILE_MOVE_FILE: 'file:move-file',
  FILE_DELETE_FILE: 'file:delete-file',
  FILE_GET_INFO: 'file:get-info',
  FILE_EXISTS: 'file:exists',

  // 对话框事件
  DIALOG_OPEN: 'dialog:open',
  DIALOG_SAVE: 'dialog:save',
  DIALOG_MESSAGE: 'dialog:message',
  DIALOG_ERROR: 'dialog:error',
  DIALOG_INFO: 'dialog:info',
  DIALOG_WARNING: 'dialog:warning',
  DIALOG_QUESTION: 'dialog:question',

  // 网络事件 - WebSocket
  WEBSOCKET_CREATE: 'websocket:create',
  WEBSOCKET_DESTROY: 'websocket:destroy',
  WEBSOCKET_SEND: 'websocket:send',
  WEBSOCKET_SEND_TO_ALL: 'websocket:send-to-all',
  WEBSOCKET_GET_MESSAGES: 'websocket:get-messages',

  // 网络事件 - UDP
  UDP_CREATE: 'udp:create',
  UDP_DESTROY: 'udp:destroy',
  UDP_SEND: 'udp:send',
  UDP_GET_MESSAGES: 'udp:get-messages',

  // 更新事件
  UPDATE_CHECK: 'update:check',
  UPDATE_DOWNLOAD: 'update:download',
  UPDATE_INSTALL: 'update:install',
} as const;

export const AppConstants = {
  APP_NAME: 'Vite React Electron',
  DEFAULT_WINDOW_WIDTH: 1200,
  DEFAULT_WINDOW_HEIGHT: 800,
  MIN_WINDOW_WIDTH: 800,
  MIN_WINDOW_HEIGHT: 600,
} as const;

export type EventName = keyof typeof Events;
export type EventValue = typeof Events[EventName]; 