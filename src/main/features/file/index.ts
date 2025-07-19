import { FileService } from './service';
import { FileIpcHandler } from './ipc';

export { FileService } from './service';
export { FileIpcHandler } from './ipc';

export const createFileModule = () => {
  const service = new FileService();
  const ipcHandler = new FileIpcHandler(service);
  
  return { service, ipcHandler };
}; 