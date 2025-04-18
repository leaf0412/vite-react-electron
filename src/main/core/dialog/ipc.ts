import { ipcMain } from 'electron';
import type {
  OpenDialogOptions,
  SaveDialogOptions,
  MessageBoxOptions,
} from 'electron';
import DialogManager from '@main/core/dialog';
import { DialogEvents } from '@main/core/dialog/event';

class DialogIpcHandler {
  constructor() {}

  initIpcHandlers() {
    ipcMain.handle(
      DialogEvents.DIALOG_OPEN,
      (_event, options: OpenDialogOptions) => {
        return DialogManager.showOpenDialog(options);
      }
    );

    ipcMain.handle(
      DialogEvents.DIALOG_SAVE,
      (_event, options: SaveDialogOptions) => {
        return DialogManager.showSaveDialog(options);
      }
    );

    ipcMain.handle(
      DialogEvents.DIALOG_MESSAGE,
      (_event, options: MessageBoxOptions) => {
        return DialogManager.showMessageBox(options);
      }
    );

    ipcMain.handle(
      DialogEvents.DIALOG_ERROR,
      (_event, options: Omit<MessageBoxOptions, 'type'>) => {
        return DialogManager.showErrorBox(options);
      }
    );

    ipcMain.handle(
      DialogEvents.DIALOG_INFO,
      (_event, options: Omit<MessageBoxOptions, 'type'>) => {
        return DialogManager.showInfoBox(options);
      }
    );

    ipcMain.handle(
      DialogEvents.DIALOG_WARNING,
      (_event, options: Omit<MessageBoxOptions, 'type'>) => {
        return DialogManager.showWarningBox(options);
      }
    );

    ipcMain.handle(
      DialogEvents.DIALOG_QUESTION,
      (_event, options: Omit<MessageBoxOptions, 'type'>) => {
        return DialogManager.showQuestionBox(options);
      }
    );
  }

  destroyIpcHandlers() {
    Object.keys(DialogEvents).forEach(key => {
      ipcMain.removeHandler(DialogEvents[key as keyof typeof DialogEvents]);
    });
  }
}

export default DialogIpcHandler;
