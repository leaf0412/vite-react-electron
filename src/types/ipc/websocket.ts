export interface WebSocketOperations {
  createAndBindWebSocket: (port: number, options?: { path?: string }) => Promise<{ success: boolean; data?: boolean; error?: string }>;
  destroyWebSocket: () => Promise<{ success: boolean; data?: void; error?: string }>;
  stopWebSocket: (port: number) => Promise<{ success: boolean; data?: boolean; error?: string }>;
  sendWebSocket: (message: string | Buffer, clientId: string, port: number) => Promise<{ success: boolean; data?: boolean; error?: string }>;
  sendToAllWebSocket: (message: string | Buffer, port: number) => Promise<{ success: boolean; data?: boolean; error?: string }>;
  getMessagesWebSocket: <T>() => Promise<{ success: boolean; data?: {
    raw: Buffer;
    parsed: T;
    client: {
      id: string;
      ip: string;
      remotePort: number;
    };
    timestamp: number;
  }[]; error?: string }>;
  clearMessagesWebSocket: () => Promise<{ success: boolean; data?: boolean; error?: string }>;
  isPortRunningWebSocket: (port: number) => Promise<{ success: boolean; data?: boolean; error?: string }>;
  getRunningPortsWebSocket: () => Promise<{ success: boolean; data?: number[]; error?: string }>;
  setMaxMessagesWebSocket: (maxMessages: number) => Promise<{ success: boolean; data?: boolean; error?: string }>;
}
