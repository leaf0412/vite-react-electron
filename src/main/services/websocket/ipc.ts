import { ipcMain } from 'electron';
import WebSocketManager from '.';
import { WebSocketEvents } from './event';

class WebSocketIpcHandler {
  private webSocketManager: WebSocketManager;

  constructor(webSocketManager: WebSocketManager) {
    this.webSocketManager = webSocketManager;
  }

  initIpcHandlers() {
    // 创建并绑定 WebSocket 服务器
    ipcMain.handle(
      WebSocketEvents.CREATE_AND_BIND_WEBSOCKET,
      async (
        _,
        port: number,
        options?: { path?: string }
      ) => {
        return await this.webSocketManager.createAndBind(port, options);
      }
    );

    // 销毁所有 WebSocket 服务器
    ipcMain.handle(WebSocketEvents.DESTROY_WEBSOCKET, async () => {
      return this.webSocketManager.destroy();
    });

    // 停止特定端口的 WebSocket 服务器
    ipcMain.handle(WebSocketEvents.STOP_WEBSOCKET, async (_, port: number) => {
      return this.webSocketManager.stop(port);
    });

    // 发送 WebSocket 消息到特定客户端
    ipcMain.handle(
      WebSocketEvents.SEND_WEBSOCKET,
      async (_, message: string | Buffer, clientId: string, port: number) => {
        return this.webSocketManager.send(message, clientId, port);
      }
    );
    
    // 发送 WebSocket 消息到所有客户端
    ipcMain.handle(
      WebSocketEvents.SEND_TO_ALL_WEBSOCKET,
      async (_, message: string | Buffer, port: number) => {
        return this.webSocketManager.sendToAll(message, port);
      }
    );

    // 获取接收到的消息
    ipcMain.handle(
      WebSocketEvents.GET_MESSAGES_WEBSOCKET,
      async () => {
        return this.webSocketManager.getMessages();
      }
    );

    // 清除所有消息
    ipcMain.handle(
      WebSocketEvents.CLEAR_MESSAGES_WEBSOCKET,
      async () => {
        this.webSocketManager.clearMessages();
        return true;
      }
    );

    // 检查端口是否正在运行
    ipcMain.handle(
      WebSocketEvents.IS_PORT_RUNNING_WEBSOCKET,
      async (_, port: number) => {
        return this.webSocketManager.isPortRunning(port);
      }
    );

    // 获取所有正在运行的端口
    ipcMain.handle(
      WebSocketEvents.GET_RUNNING_PORTS_WEBSOCKET,
      async () => {
        return this.webSocketManager.getRunningPorts();
      }
    );

    // 设置最大消息数
    ipcMain.handle(
      WebSocketEvents.SET_MAX_MESSAGES_WEBSOCKET,
      async (_, maxMessages: number) => {
        return this.webSocketManager.setMaxMessages(maxMessages);
      }
    );
  }

  destroyIpcHandlers() {
    Object.keys(WebSocketEvents).forEach(key => {
      ipcMain.removeHandler(WebSocketEvents[key as keyof typeof WebSocketEvents]);
    });
  }
}

export default WebSocketIpcHandler; 