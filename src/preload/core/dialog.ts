import { ipcRenderer, OpenDialogOptions, SaveDialogOptions } from 'electron';
import { Events } from '@main/ipc/ipc-events';
import { DialogOptions } from '@/types/ipc/dialog';

export const dialogApi = {
  openDialog: (options: OpenDialogOptions) =>
    ipcRenderer.invoke(Events.DIALOG_OPEN, options),
  saveDialog: (options: SaveDialogOptions) =>
    ipcRenderer.invoke(Events.DIALOG_SAVE, options),
  showMessageDialog: (options: DialogOptions) =>
    ipcRenderer.invoke(Events.DIALOG_MESSAGE, options),
  showErrorDialog: (options: Omit<DialogOptions, 'type'>) =>
    ipcRenderer.invoke(Events.DIALOG_ERROR, options),
  showInfoDialog: (options: Omit<DialogOptions, 'type'>) =>
    ipcRenderer.invoke(Events.DIALOG_INFO, options),
  showWarningDialog: (options: Omit<DialogOptions, 'type'>) =>
    ipcRenderer.invoke(Events.DIALOG_WARNING, options),
  showQuestionDialog: (options: Omit<DialogOptions, 'type'>) =>
    ipcRenderer.invoke(Events.DIALOG_QUESTION, options),
};
