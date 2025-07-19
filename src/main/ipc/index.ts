// core
export { default as WindowIpcHandler } from '@main/core/window/ipc';

// services
export { default as DialogIpcHandler } from '@main/services/dialog/ipc';
export { default as UpgradeIpcHandler } from '@main/services/upgrade/ipc';
export { default as UdpIpcHandler } from '@main/services/udp/ipc';
export { default as WebSocketIpcHandler } from '@main/services/websocket/ipc';

// management
export { IpcManager, type IIpcHandler } from '@main/ipc/manager';
