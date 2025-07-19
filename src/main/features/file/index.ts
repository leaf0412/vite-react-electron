import { FileService } from './service';
import { FileIpcHandler } from './ipc';

// 新的 API
export { FileService } from './service';
export { FileIpcHandler } from './ipc';

// 向后兼容的 API
export { default as FileManager } from './adapter';

export const createFileModule = () => {
  const service = new FileService();
  const ipcHandler = new FileIpcHandler(service);
  
  return { service, ipcHandler };
}; 