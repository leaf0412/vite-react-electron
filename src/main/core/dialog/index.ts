import { dialog } from 'electron';
import type {
  OpenDialogOptions,
  SaveDialogOptions,
  MessageBoxOptions,
} from 'electron';

export default class DialogManager {
  static showOpenDialog(options: OpenDialogOptions) {
    return dialog.showOpenDialog(options);
  }

  static showSaveDialog(options: SaveDialogOptions) {
    return dialog.showSaveDialog(options);
  }

  static showMessageBox(options: MessageBoxOptions) {
    return dialog.showMessageBox(options);
  }

  static showErrorBox(options: Omit<MessageBoxOptions, 'type'>) {
    return dialog.showMessageBox({ ...options, type: 'error' });
  }

  static showInfoBox(options: Omit<MessageBoxOptions, 'type'>) {
    return dialog.showMessageBox({ ...options, type: 'info' });
  }

  static showWarningBox(options: Omit<MessageBoxOptions, 'type'>) {
    return dialog.showMessageBox({ ...options, type: 'warning' });
  }

  static showQuestionBox(options: Omit<MessageBoxOptions, 'type'>) {
    return dialog.showMessageBox({ ...options, type: 'question' });
  }
}
