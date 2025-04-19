export interface WebSocketOperations {
  createAndBindWebSocket: (port: number) => Promise<boolean>;
  destroyWebSocket: () => Promise<void>;
  stopWebSocket: (port: number) => Promise<void>;
  sendWebSocket: (message: string, port: number) => Promise<void>;
  getMessagesWebSocket: <T>() => Promise<
    {
      raw: Buffer;
      parsed: T;
      client: {
        id: string;
        ip: string;
        remotePort: number;
      };
      timestamp: number;
    }[]
  >;
  clearMessagesWebSocket: () => Promise<void>;
  isPortRunningWebSocket: (port: number) => Promise<boolean>;
  getRunningPortsWebSocket: () => Promise<number[]>;
  setMaxMessagesWebSocket: (maxMessages: number) => Promise<void>;
}
