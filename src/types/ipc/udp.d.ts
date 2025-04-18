export interface UdpOperations {
  createAndBindUdp: (
    port: number,
    options?: { broadcast?: boolean; multicastAddr?: string }
  ) => Promise<boolean>;
  destroyUdp: () => Promise<void>;
  stopUdp: (port: number) => Promise<void>;
  sendUdp: (message: string, address: string, port: number) => Promise<void>;
  getMessagesUdp: <T>() => Promise<{
    raw: Buffer;
    parsed: T;
    rinfo: RemoteInfo;
  }[]>;
  clearMessagesUdp: () => Promise<void>;
  isPortRunningUdp: (port: number) => Promise<boolean>;
  getRunningPortsUdp: () => Promise<number[]>;
  setMaxMessagesUdp: (maxMessages: number) => Promise<void>;
}
