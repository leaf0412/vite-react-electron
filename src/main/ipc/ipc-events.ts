// core
import { WindowEvents } from '@main/core/window/event';
// services
import { UpgradeEvents } from '@main/services/upgrade/event';
import { UdpEvents } from '@main/services/udp/event';
import { WebSocketEvents } from '@main/services/websocket/event';
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

export const Events = {
  ...CommandEvents,
  ...WindowEvents,
  ...DialogEvents,
  ...FileEvents,
  ...UpgradeEvents,
  ...UdpEvents,
  ...WebSocketEvents,
} as const;

export type EventKeys = keyof typeof Events;
