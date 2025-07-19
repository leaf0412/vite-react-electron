export type DialogType = 'none' | 'info' | 'error' | 'question' | 'warning';

export interface DialogOptions {
  title?: string;
  message: string;
  detail?: string;
  type?: DialogType;
  buttons?: string[];
  defaultId?: number;
}

import { IpcResponse } from './index';

export interface DialogOperations {
  openDialog(options: Electron.OpenDialogOptions): Promise<IpcResponse<Electron.OpenDialogReturnValue>>;
  saveDialog(options: Electron.SaveDialogOptions): Promise<IpcResponse<Electron.SaveDialogReturnValue>>;
  showMessageDialog(options: DialogOptions): Promise<IpcResponse<Electron.MessageBoxReturnValue>>;
  showErrorDialog(options: Omit<DialogOptions, 'type'>): Promise<IpcResponse<Electron.MessageBoxReturnValue>>;
  showInfoDialog(options: Omit<DialogOptions, 'type'>): Promise<IpcResponse<Electron.MessageBoxReturnValue>>;
  showWarningDialog(options: Omit<DialogOptions, 'type'>): Promise<IpcResponse<Electron.MessageBoxReturnValue>>;
  showQuestionDialog(options: Omit<DialogOptions, 'type'>): Promise<IpcResponse<Electron.MessageBoxReturnValue>>;
} 