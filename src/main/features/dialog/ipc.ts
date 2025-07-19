import { ipcMain } from 'electron';
import type {
  OpenDialogOptions,
  SaveDialogOptions,
  MessageBoxOptions,
} from 'electron';
import { Events } from '../../shared/constants';
import { Logger } from '../../core/logger';
import { DialogService } from './service';

export class DialogIpcHandler {
  private logger = Logger.create('DialogIpcHandler');

  constructor(private dialogService: DialogService) {}

  private async handleAsync<T>(operation: () => Promise<T>): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Dialog operation failed:', error);
      return { success: false, error: errorMessage };
    }
  }

  register(): void {
    // 打开文件对话框
    ipcMain.handle(Events.DIALOG_OPEN, async (_, options: OpenDialogOptions) => {
      return this.handleAsync(() => this.dialogService.showOpenDialog(options));
    });

    // 保存文件对话框
    ipcMain.handle(Events.DIALOG_SAVE, async (_, options: SaveDialogOptions) => {
      return this.handleAsync(() => this.dialogService.showSaveDialog(options));
    });

    // 消息对话框
    ipcMain.handle(Events.DIALOG_MESSAGE, async (_, options: MessageBoxOptions) => {
      return this.handleAsync(() => this.dialogService.showMessageBox(options));
    });

    // 错误对话框
    ipcMain.handle(Events.DIALOG_ERROR, async (_, options: Omit<MessageBoxOptions, 'type'>) => {
      return this.handleAsync(() => this.dialogService.showErrorBox(options));
    });

    // 信息对话框
    ipcMain.handle(Events.DIALOG_INFO, async (_, options: Omit<MessageBoxOptions, 'type'>) => {
      return this.handleAsync(() => this.dialogService.showInfoBox(options));
    });

    // 警告对话框
    ipcMain.handle(Events.DIALOG_WARNING, async (_, options: Omit<MessageBoxOptions, 'type'>) => {
      return this.handleAsync(() => this.dialogService.showWarningBox(options));
    });

    // 询问对话框
    ipcMain.handle(Events.DIALOG_QUESTION, async (_, options: Omit<MessageBoxOptions, 'type'>) => {
      return this.handleAsync(() => this.dialogService.showQuestionBox(options));
    });

    this.logger.info('Dialog IPC handlers registered');
  }

  unregister(): void {
    const events = [
      Events.DIALOG_OPEN,
      Events.DIALOG_SAVE,
      Events.DIALOG_MESSAGE,
      Events.DIALOG_ERROR,
      Events.DIALOG_INFO,
      Events.DIALOG_WARNING,
      Events.DIALOG_QUESTION,
    ];

    events.forEach(event => {
      ipcMain.removeHandler(event);
    });

    this.logger.info('Dialog IPC handlers unregistered');
  }
} 