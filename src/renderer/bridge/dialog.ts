import { OpenDialogOptions, SaveDialogOptions } from 'electron';
import { DialogOptions } from '@/types/ipc/dialog';

const ipcRenderer = window.ipcRenderer;

export const openDialog = (options: OpenDialogOptions) => {
  return ipcRenderer.openDialog(options);
};

export const saveDialog = (options: SaveDialogOptions) => {
  return ipcRenderer.saveDialog(options);
};

export const showMessageDialog = (options: DialogOptions) => {
  return ipcRenderer.showMessageDialog(options);
};

export const showErrorDialog = (options: Omit<DialogOptions, 'type'>) => {
  return ipcRenderer.showErrorDialog(options);
};

export const showInfoDialog = (options: Omit<DialogOptions, 'type'>) => {
  return ipcRenderer.showInfoDialog(options);
};

export const showWarningDialog = (options: Omit<DialogOptions, 'type'>) => {
  return ipcRenderer.showWarningDialog(options);
};

export const showQuestionDialog = (options: Omit<DialogOptions, 'type'>) => {
  return ipcRenderer.showQuestionDialog(options);
};
