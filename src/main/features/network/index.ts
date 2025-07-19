import { NetworkService } from './service';
import { NetworkIpcHandler } from './ipc';

export { NetworkService } from './service';
export { NetworkIpcHandler } from './ipc';
export { UdpService } from './udp-service';
export { WebSocketService } from './websocket-service';

export const createNetworkModule = () => {
  const service = new NetworkService();
  const ipcHandler = new NetworkIpcHandler(service);
  
  return { service, ipcHandler };
}; 