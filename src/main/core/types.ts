import type WindowManager from '@main/core/window';
import type { DialogService } from '@main/features/dialog';
import type { FileService } from '@main/features/file';
import type UpgradeManager from '@main/services/upgrade';
import type UdpManager from '@main/services/udp';
import type WebSocketManager from '@main/services/websocket';

export interface ServiceRegistry {
  windowManager: WindowManager;
  dialogManager: DialogService;
  fileManager: FileService;
  upgradeManager: UpgradeManager;
  udpManager: UdpManager;
  websocketManager: WebSocketManager;
}

export type ServiceName = keyof ServiceRegistry;

export interface IService {
  dispose?(): Promise<void>;
  destroy?(): Promise<void>;
} 