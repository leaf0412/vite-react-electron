import { dialog, ipcMain } from 'electron';
import type {
  OpenDialogOptions,
  SaveDialogOptions,
  MessageBoxOptions,
} from 'electron';
import { DialogEvents } from '@electron/config/ipc-events';

export const Events = DialogEvents;

export function initDialogIpcHandlers() {
  ipcMain.handle(Events.DIALOG_OPEN, (_event, options: OpenDialogOptions) => {
    return dialog.showOpenDialog(options);
  });

  ipcMain.handle(Events.DIALOG_SAVE, (_event, options: SaveDialogOptions) => {
    return dialog.showSaveDialog(options);
  });

  ipcMain.handle(
    Events.DIALOG_MESSAGE,
    (_event, options: MessageBoxOptions) => {
      return dialog.showMessageBox(options);
    }
  );

  ipcMain.handle(
    Events.DIALOG_ERROR,
    (_event, options: Omit<MessageBoxOptions, 'type'>) => {
      return dialog.showMessageBox({ ...options, type: 'error' });
    }
  );

  ipcMain.handle(
    Events.DIALOG_INFO,
    (_event, options: Omit<MessageBoxOptions, 'type'>) => {
      return dialog.showMessageBox({ ...options, type: 'info' });
    }
  );

  ipcMain.handle(
    Events.DIALOG_WARNING,
    (_event, options: Omit<MessageBoxOptions, 'type'>) => {
      return dialog.showMessageBox({ ...options, type: 'warning' });
    }
  );

  ipcMain.handle(
    Events.DIALOG_QUESTION,
    (_event, options: Omit<MessageBoxOptions, 'type'>) => {
      return dialog.showMessageBox({ ...options, type: 'question' });
    }
  );
}

export function destroyDialogIpcHandlers() {
  Object.keys(Events).forEach(key => {
    ipcMain.removeHandler(Events[key as keyof typeof Events]);
  });
}
