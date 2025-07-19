import { DialogService } from './service';
import { DialogIpcHandler } from './ipc';

export { DialogService } from './service';
export { DialogIpcHandler } from './ipc';

export const createDialogModule = () => {
  const service = new DialogService();
  const ipcHandler = new DialogIpcHandler(service);
  
  return { service, ipcHandler };
}; 