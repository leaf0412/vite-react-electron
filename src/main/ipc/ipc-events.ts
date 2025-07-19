// core
import { WindowEvents } from '@main/core/window/event';

// shared (导入文件和对话框相关事件)
import { Events as SharedEvents } from '@main/shared/constants';

export const CommandEvents = {
  STARTUP_LOADING_PROGRESS: 'STARTUP_LOADING_PROGRESS',
  MAIN_WINDOW_READY: 'MAIN_WINDOW_READY',
  GET_LANGUAGE: 'GET_LANGUAGE',
} as const;

// 提取文件和对话框相关的事件
const FileEvents = {
  FILE_READ_DIRECTORY: SharedEvents.FILE_READ_DIRECTORY,
  FILE_CREATE_DIRECTORY: SharedEvents.FILE_CREATE_DIRECTORY,
  FILE_CREATE_FILE: SharedEvents.FILE_CREATE_FILE,
  FILE_READ_FILE: SharedEvents.FILE_READ_FILE,
  FILE_COPY_FILE: SharedEvents.FILE_COPY_FILE,
  FILE_MOVE_FILE: SharedEvents.FILE_MOVE_FILE,
  FILE_DELETE_FILE: SharedEvents.FILE_DELETE_FILE,
  FILE_GET_INFO: SharedEvents.FILE_GET_INFO,
  FILE_EXISTS: SharedEvents.FILE_EXISTS,
} as const;

const DialogEvents = {
  DIALOG_OPEN: SharedEvents.DIALOG_OPEN,
  DIALOG_SAVE: SharedEvents.DIALOG_SAVE,
  DIALOG_MESSAGE: SharedEvents.DIALOG_MESSAGE,
  DIALOG_ERROR: SharedEvents.DIALOG_ERROR,
  DIALOG_INFO: SharedEvents.DIALOG_INFO,
  DIALOG_WARNING: SharedEvents.DIALOG_WARNING,
  DIALOG_QUESTION: SharedEvents.DIALOG_QUESTION,
} as const;

// 提取网络相关的事件
const NetworkEvents = {
  // UDP Events
  UDP_CREATE: SharedEvents.UDP_CREATE,
  UDP_DESTROY: SharedEvents.UDP_DESTROY,
  UDP_STOP: SharedEvents.UDP_STOP,
  UDP_SEND: SharedEvents.UDP_SEND,
  UDP_GET_MESSAGES: SharedEvents.UDP_GET_MESSAGES,
  UDP_CLEAR_MESSAGES: SharedEvents.UDP_CLEAR_MESSAGES,
  UDP_IS_PORT_RUNNING: SharedEvents.UDP_IS_PORT_RUNNING,
  UDP_GET_RUNNING_PORTS: SharedEvents.UDP_GET_RUNNING_PORTS,
  UDP_SET_MAX_MESSAGES: SharedEvents.UDP_SET_MAX_MESSAGES,
  
  // WebSocket Events
  WEBSOCKET_CREATE: SharedEvents.WEBSOCKET_CREATE,
  WEBSOCKET_DESTROY: SharedEvents.WEBSOCKET_DESTROY,
  WEBSOCKET_STOP: SharedEvents.WEBSOCKET_STOP,
  WEBSOCKET_SEND: SharedEvents.WEBSOCKET_SEND,
  WEBSOCKET_SEND_TO_ALL: SharedEvents.WEBSOCKET_SEND_TO_ALL,
  WEBSOCKET_GET_MESSAGES: SharedEvents.WEBSOCKET_GET_MESSAGES,
  WEBSOCKET_CLEAR_MESSAGES: SharedEvents.WEBSOCKET_CLEAR_MESSAGES,
  WEBSOCKET_IS_PORT_RUNNING: SharedEvents.WEBSOCKET_IS_PORT_RUNNING,
  WEBSOCKET_GET_RUNNING_PORTS: SharedEvents.WEBSOCKET_GET_RUNNING_PORTS,
  WEBSOCKET_SET_MAX_MESSAGES: SharedEvents.WEBSOCKET_SET_MAX_MESSAGES,
} as const;

export const Events = {
  ...CommandEvents,
  ...WindowEvents,
  ...DialogEvents,
  ...FileEvents,
  ...NetworkEvents,
} as const;

export type EventKeys = keyof typeof Events;
