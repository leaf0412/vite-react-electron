import type WindowManager from '@main/core/window';
import type { DialogService } from '@main/features/dialog';
import type { FileService } from '@main/features/file';
import type { NetworkService } from '@main/features/network';
export interface ServiceRegistry {
  windowManager: WindowManager;
  dialogManager: DialogService;
  fileManager: FileService;
  networkManager: NetworkService;
}

export type ServiceName = keyof ServiceRegistry;

export interface IService {
  dispose?(): Promise<void>;
  destroy?(): Promise<void>;
} 