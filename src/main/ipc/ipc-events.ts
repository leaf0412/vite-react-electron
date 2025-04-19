// core
import { WindowEvents } from '@main/core/window/event';
import { DialogEvents } from '@main/core/dialog/event';
import { UpgradeEvents } from '@main/core/upgrade/event';
// services
import { FileManagerEvents } from '@main/services/file/event';
// network
import { UdpEvents } from '@main/network/udp/event';
import { WebSocketEvents } from '@main/network/websocket/event';

export const CommandEvents = {
  STARTUP_LOADING_PROGRESS: 'STARTUP_LOADING_PROGRESS',
  MAIN_WINDOW_READY: 'MAIN_WINDOW_READY',
  GET_LANGUAGE: 'GET_LANGUAGE',
} as const;

export const Events = {
  ...CommandEvents,
  ...WindowEvents,
  ...DialogEvents,
  ...FileManagerEvents,
  ...UpgradeEvents,
  ...UdpEvents,
  ...WebSocketEvents,
} as const;

export type EventKeys = keyof typeof Events;
