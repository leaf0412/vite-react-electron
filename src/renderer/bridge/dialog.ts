import { OpenDialogOptions, SaveDialogOptions } from 'electron';
import { DialogOptions } from '@/types/ipc/dialog';

const ipcRenderer = window.ipcRenderer;

// 辅助函数：处理IPC响应格式
const handleIpcResponse = <T,>(result: { success: boolean; data?: T; error?: string }): T => {
  if (!result.success) {
    throw new Error(result.error || '操作失败');
  }
  return result.data!;
};

export const openDialog = async (options: OpenDialogOptions) => {
  const result = await ipcRenderer.openDialog(options);
  return handleIpcResponse(result);
};

export const saveDialog = async (options: SaveDialogOptions) => {
  const result = await ipcRenderer.saveDialog(options);
  return handleIpcResponse(result);
};

export const showMessageDialog = async (options: DialogOptions) => {
  const result = await ipcRenderer.showMessageDialog(options);
  return handleIpcResponse(result);
};

export const showErrorDialog = async (options: Omit<DialogOptions, 'type'>) => {
  const result = await ipcRenderer.showErrorDialog(options);
  return handleIpcResponse(result);
};

export const showInfoDialog = async (options: Omit<DialogOptions, 'type'>) => {
  const result = await ipcRenderer.showInfoDialog(options);
  return handleIpcResponse(result);
};

export const showWarningDialog = async (options: Omit<DialogOptions, 'type'>) => {
  const result = await ipcRenderer.showWarningDialog(options);
  return handleIpcResponse(result);
};

export const showQuestionDialog = async (options: Omit<DialogOptions, 'type'>) => {
  const result = await ipcRenderer.showQuestionDialog(options);
  return handleIpcResponse(result);
};
