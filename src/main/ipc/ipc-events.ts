import { WindowEvents } from '@main/core/window/event';
import { DialogEvents } from '@main/core/dialog/event';
import { FileManagerEvents } from '@main/core/file/event';
import { UpgradeEvents } from '@main/core/upgrade/event';

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
} as const;

export type EventKeys = keyof typeof Events;
