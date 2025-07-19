import { dialog } from 'electron';
import type {
  OpenDialogOptions,
  SaveDialogOptions,
  MessageBoxOptions,
} from 'electron';
import { Logger } from '../../core/logger';

export class DialogService {
  private logger = Logger.create('DialogService');

  constructor() {
    this.logger.info('DialogService initialized');
  }

  async showOpenDialog(options: OpenDialogOptions) {
    try {
      this.logger.debug('Opening file dialog', { title: options.title });
      const result = await dialog.showOpenDialog(options);
      this.logger.debug('File dialog result', { canceled: result.canceled, filesCount: result.filePaths?.length });
      return result;
    } catch (error) {
      this.logger.error('Failed to show open dialog:', error);
      throw new Error(`Failed to show open dialog: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async showSaveDialog(options: SaveDialogOptions) {
    try {
      this.logger.debug('Opening save dialog', { title: options.title });
      const result = await dialog.showSaveDialog(options);
      this.logger.debug('Save dialog result', { canceled: result.canceled, filePath: result.filePath });
      return result;
    } catch (error) {
      this.logger.error('Failed to show save dialog:', error);
      throw new Error(`Failed to show save dialog: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async showMessageBox(options: MessageBoxOptions) {
    try {
      this.logger.debug('Opening message box', { type: options.type, title: options.title });
      const result = await dialog.showMessageBox(options);
      this.logger.debug('Message box result', { response: result.response });
      return result;
    } catch (error) {
      this.logger.error('Failed to show message box:', error);
      throw new Error(`Failed to show message box: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async showErrorBox(options: Omit<MessageBoxOptions, 'type'>) {
    return this.showMessageBox({ ...options, type: 'error' });
  }

  async showInfoBox(options: Omit<MessageBoxOptions, 'type'>) {
    return this.showMessageBox({ ...options, type: 'info' });
  }

  async showWarningBox(options: Omit<MessageBoxOptions, 'type'>) {
    return this.showMessageBox({ ...options, type: 'warning' });
  }

  async showQuestionBox(options: Omit<MessageBoxOptions, 'type'>) {
    return this.showMessageBox({ ...options, type: 'question' });
  }
} 