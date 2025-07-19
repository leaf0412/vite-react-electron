export interface UdpOperations {
  createAndBindUdp: (
    port: number,
    options?: { broadcast?: boolean; multicastAddr?: string }
  ) => Promise<{ success: boolean; data?: boolean; error?: string }>;
  destroyUdp: () => Promise<{ success: boolean; data?: void; error?: string }>;
  stopUdp: (port: number) => Promise<{ success: boolean; data?: boolean; error?: string }>;
  sendUdp: (message: string, address: string, port: number) => Promise<{ success: boolean; data?: boolean; error?: string }>;
  getMessagesUdp: <T>() => Promise<{ success: boolean; data?: {
    raw: Buffer;
    parsed: T;
    rinfo: RemoteInfo;
  }[]; error?: string }>;
  clearMessagesUdp: () => Promise<{ success: boolean; data?: boolean; error?: string }>;
  isPortRunningUdp: (port: number) => Promise<{ success: boolean; data?: boolean; error?: string }>;
  getRunningPortsUdp: () => Promise<{ success: boolean; data?: number[]; error?: string }>;
  setMaxMessagesUdp: (maxMessages: number) => Promise<{ success: boolean; data?: boolean; error?: string }>;
}
