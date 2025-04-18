export type DialogType = 'none' | 'info' | 'error' | 'question' | 'warning';

export interface DialogOptions {
  title?: string;
  message: string;
  detail?: string;
  type?: DialogType;
  buttons?: string[];
  defaultId?: number;
}

export interface DialogOperations {
  openDialog(options: Electron.OpenDialogOptions): Promise<Electron.OpenDialogReturnValue>;
  saveDialog(options: Electron.SaveDialogOptions): Promise<Electron.SaveDialogReturnValue>;
  showMessageDialog(options: DialogOptions): Promise<Electron.MessageBoxReturnValue>;
  showErrorDialog(options: Omit<DialogOptions, 'type'>): Promise<Electron.MessageBoxReturnValue>;
  showInfoDialog(options: Omit<DialogOptions, 'type'>): Promise<Electron.MessageBoxReturnValue>;
  showWarningDialog(options: Omit<DialogOptions, 'type'>): Promise<Electron.MessageBoxReturnValue>;
  showQuestionDialog(options: Omit<DialogOptions, 'type'>): Promise<Electron.MessageBoxReturnValue>;
} 