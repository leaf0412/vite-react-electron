import type WindowManager from '@main/core/window';
import type DialogManager from '@main/services/dialog';
import type FileManager from '@main/services/file';
import type UpgradeManager from '@main/services/upgrade';
import type UdpManager from '@main/services/udp';
import type WebSocketManager from '@main/services/websocket';

export interface ServiceRegistry {
  windowManager: WindowManager;
  dialogManager: DialogManager;
  fileManager: FileManager;
  upgradeManager: UpgradeManager;
  udpManager: UdpManager;
  websocketManager: WebSocketManager;
}

export type ServiceName = keyof ServiceRegistry;

export interface IService {
  dispose?(): Promise<void>;
  destroy?(): Promise<void>;
} 