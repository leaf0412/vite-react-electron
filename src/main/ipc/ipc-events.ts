// core
import { WindowEvents } from '@main/core/window/event';
// services
import { DialogEvents } from '@main/services/dialog/event';
import { UpgradeEvents } from '@main/services/upgrade/event';
import { UdpEvents } from '@main/services/udp/event';
import { WebSocketEvents } from '@main/services/websocket/event';
// shared (只导入文件相关事件)
import { Events as SharedEvents } from '@main/shared/constants';

export const CommandEvents = {
  STARTUP_LOADING_PROGRESS: 'STARTUP_LOADING_PROGRESS',
  MAIN_WINDOW_READY: 'MAIN_WINDOW_READY',
  GET_LANGUAGE: 'GET_LANGUAGE',
} as const;

// 只提取文件相关的事件
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
