import { ipcMain } from 'electron';
import UdpManager from '@main/network/udp';
import { UdpEvents } from '@main/network/udp/event';

class UdpIpcHandler {
  private udpManager: UdpManager;

  constructor() {
    this.udpManager = new UdpManager();
  }

  initIpcHandlers() {
    // 创建并绑定 UDP 服务器
    ipcMain.handle(
      UdpEvents.CREATE_AND_BIND,
      async (
        _,
        port: number,
        options?: { broadcast?: boolean; multicastAddr?: string }
      ) => {
        return await this.udpManager.createAndBind(port, options);
      }
    );

    // 销毁所有 UDP 服务器
    ipcMain.handle(UdpEvents.DESTROY, async () => {
      return this.udpManager.destroy();
    });

    // 停止特定端口的 UDP 服务器
    ipcMain.handle(UdpEvents.STOP, async (_, port: number) => {
      return this.udpManager.stop(port);
    });

    // 发送 UDP 消息
    ipcMain.handle(
      UdpEvents.SEND,
      async (_, message: string | Buffer, address: string, port: number) => {
        return this.udpManager.send(message, address, port);
      }
    );

    // 获取接收到的消息
    ipcMain.handle(UdpEvents.GET_MESSAGES, async () => {
      return this.udpManager.getMessages();
    });

    // 清除所有消息
    ipcMain.handle(UdpEvents.CLEAR_MESSAGES, async () => {
      this.udpManager.clearMessages();
      return true;
    });

    // 检查端口是否正在运行
    ipcMain.handle(UdpEvents.IS_PORT_RUNNING, async (_, port: number) => {
      return this.udpManager.isPortRunning(port);
    });

    // 获取所有正在运行的端口
    ipcMain.handle(UdpEvents.GET_RUNNING_PORTS, async () => {
      return this.udpManager.getRunningPorts();
    });

    // 设置最大消息数
    ipcMain.handle(UdpEvents.SET_MAX_MESSAGES, async (_, maxMessages: number) => {
      return this.udpManager.setMaxMessages(maxMessages);
    });
  }

  destroyIpcHandlers() {
    Object.keys(UdpEvents).forEach(key => {
      ipcMain.removeHandler(UdpEvents[key as keyof typeof UdpEvents]);
    });
  }
}

export default UdpIpcHandler;
