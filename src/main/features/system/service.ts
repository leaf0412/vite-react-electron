import { BrowserWindow, app } from 'electron';
import { Logger } from '../../core/logger';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import * as crypto from 'crypto';
import axios from 'axios';
import * as YAML from 'yaml';
import { isLinux, isMac, isWindows } from '@/main/constants';

interface UpdateProgress {
  percent: number;
  transferred: number;
  total: number;
}

type UpgradeProgressType = 'check' | 'download' | 'downloaded';

interface ManualUpdateInfo {
  hasUpdate: boolean;
  version?: string;
  downloadUrl?: string;
  fileName?: string;
  fileSize?: number;
  md5?: string;
  publishedAt?: string;
  message?: string;
}

interface UnifiedUpdateInfo extends ManualUpdateInfo {
  updateMethod: 'auto' | 'manual';
}

interface UpdateResult {
  success: boolean;
  data?: UnifiedUpdateInfo;
  error?: string;
}

interface DownloadInstallResult {
  success: boolean;
  data?: {
    filePath?: string;
    updateMethod: 'auto' | 'manual';
    autoRestart?: boolean;
  };
  error?: string;
}

interface VersionInfo {
  version: string;
  fileName: string;
  fileSize?: number;
  sha512?: string;
}

interface YamlConfig {
  version: string;
  path?: string;
  files?: Array<{
    url: string;
    size?: number;
    sha512?: string;
  }>;
}

export class SystemService {
  private logger = Logger.create('SystemService');
  private mainWindow?: BrowserWindow;
  private pendingUpdateInfo?: ManualUpdateInfo;

  private timeout: number = 120000; // 增加超时时间到2分钟

  constructor() {
    this.logger.info('SystemService initialized');
  }

  getSystemInfo() {
    return {
      platform: process.platform,
      homedir: process.env.HOME || process.env.USERPROFILE || '',
      arch: process.arch,
      nodeVersion: process.version,
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome,
    };
  }

  getAppVersion(): string {
    return app.getVersion();
  }

  setMainWindow(mainWindow: BrowserWindow): void {
    this.mainWindow = mainWindow;
  }

    // 统一更新接口
  async checkForUpdates(options?: {
    serverUrl?: string;
    autoDownload?: boolean;
  }): Promise<UpdateResult> {
    try {
      const serverUrl = options?.serverUrl || 'http://192.168.3.18:8080';
      const result = await this.checkManualUpdate(serverUrl);
      this.logger.info('checkManualUpdate 返回结果:', result);
      
      if (result.success && result.data) {
        this.pendingUpdateInfo = result.data;
        const finalResult = {
          success: true,
          data: {
            ...result.data,
            updateMethod: 'manual' as const,
          },
        };
        this.logger.info('checkForUpdates 最终返回结果:', finalResult);
        return finalResult;
      }
      
      const errorResult = {
        success: false,
        error: result.error || '未知错误',
      };
      this.logger.info('checkForUpdates 错误返回结果:', errorResult);
      return errorResult;
    } catch (error) {
      this.logger.error('检查更新失败', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async downloadAndInstall(): Promise<DownloadInstallResult> {
    try {
      if (!this.pendingUpdateInfo?.downloadUrl) {
        return {
          success: false,
          error: '没有可用的更新信息，请先检查更新',
        };
      }

      const result = await this.downloadAndInstallManually({
        downloadUrl: this.pendingUpdateInfo.downloadUrl,
        version: this.pendingUpdateInfo.version!,
        fileName: this.pendingUpdateInfo.fileName!,
        md5: this.pendingUpdateInfo.md5,
      });

      if (result.success) {
        return {
          success: true,
          data: {
            filePath: result.filePath,
            updateMethod: 'manual' as const,
          },
        };
      }
      return result;
    } catch (error) {
      this.logger.error('下载安装失败', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async quitAndInstall(): Promise<{ success: boolean; error?: string }> {
    try {
      return {
        success: false,
        error: '此平台不支持自动安装，请手动安装',
      };
    } catch (error) {
      this.logger.error('退出并安装失败', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }



  // 手动更新功能
  async checkManualUpdate(
    serverUrl: string
  ): Promise<{ success: boolean; data?: ManualUpdateInfo; error?: string }> {
    try {
      const currentVersion = this.getAppVersion();
      const platform = process.platform;

      this.logger.info(`检查手动更新: 当前版本 ${currentVersion}`);

      // 从静态文件服务器获取最新版本
      const versionInfo = await this.getLatestVersionFromServer(
        serverUrl,
        platform
      );

      this.logger.info(
        `服务器版本: ${versionInfo.version}, 当前版本: ${currentVersion}`
      );

      const needUpdate = currentVersion !== versionInfo.version;

      this.logger.info(`版本比较结果: ${needUpdate ? '需要更新' : '无需更新'}`);

      if (needUpdate) {
        const downloadUrl = `${serverUrl}/${versionInfo.fileName}`;

        // 检查文件是否存在（如果没有从配置文件获取到大小信息）
        let fileSize = versionInfo.fileSize;
        if (!fileSize) {
          try {
            const headResponse = await axios.head(downloadUrl, {
              timeout: this.timeout,
            });
            fileSize = parseInt(headResponse.headers['content-length'] || '0');
          } catch (fileError) {
            this.logger.error('文件不存在或无法访问:', downloadUrl);
            return {
              success: false,
              error: `更新文件不存在: ${versionInfo.fileName}`,
            };
          }
        }

        return {
          success: true,
          data: {
            hasUpdate: true,
            version: versionInfo.version,
            downloadUrl,
            fileName: versionInfo.fileName,
            fileSize,
            md5: versionInfo.sha512,
            publishedAt: new Date().toISOString(),
          },
        };
      }

      return {
        success: true,
        data: {
          hasUpdate: false,
        },
      };
    } catch (error) {
      this.logger.error('检查手动更新失败', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async downloadAndInstallManually(updateInfo: {
    downloadUrl: string;
    version: string;
    fileName: string;
    md5?: string;
  }): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const { downloadUrl, fileName, md5 } = updateInfo;

      const downloadsDir = path.join(app.getPath('downloads'), 'app-updates');
      await fs.mkdir(downloadsDir, { recursive: true });

      const filePath = path.join(downloadsDir, fileName);

      this.logger.info(`开始下载更新包: ${downloadUrl} -> ${filePath}`);

      await this.downloadFileWithRetry(downloadUrl, filePath, md5);

      this.logger.info(`更新包下载完成: ${filePath}`);

      this.openInstallPack(filePath);

      return { success: true, filePath };
    } catch (error) {
      this.logger.error('手动下载安装失败', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async downloadFileWithRetry(
    url: string,
    filePath: string,
    expectedMd5?: string
  ): Promise<void> {
    this.logger.info(
      `downloadFileWithRetry ${url} ${filePath} ${expectedMd5}`
    );
    
    await this.downloadFileWithProgress(url, filePath);

    if (expectedMd5) {
      const actualSHA512 = await this.calculateSHA512(filePath);
      if (actualSHA512 !== expectedMd5) {
        throw new Error(
          `SHA512校验失败: 期望 ${expectedMd5}, 实际 ${actualSHA512}`
        );
      }
      this.logger.info('SHA512校验通过');
    }
  }

  private downloadFileWithProgress(
    url: string,
    filePath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let lastLoaded = 0;

      // 主超时计时器
      const timeoutId = setTimeout(() => {
        this.logger.error(`下载总超时: ${this.timeout}ms`);
        reject(new Error('下载总超时'));
      }, this.timeout);

      const cleanup = () => {
        clearTimeout(timeoutId);
      };

      this.logger.info(`开始下载: ${url} -> ${filePath}`);

      // 确保目标目录存在
      try {
        const dir = path.dirname(filePath);
        if (!fsSync.existsSync(dir)) {
          fsSync.mkdirSync(dir, { recursive: true });
        }
      } catch (err) {
        this.logger.error(`创建目录失败: ${err}`);
      }

      axios({
        method: 'get',
        url: url,
        responseType: 'stream',
        timeout: this.timeout,
        // 增加重试和超时设置
        maxRedirects: 5,
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
        onDownloadProgress: progressEvent => {
          const { loaded, total } = progressEvent;

          if (total) {
            const percent = Math.round((loaded / total) * 100);
            const elapsedSeconds = (Date.now() - startTime) / 1000;
            const speed = elapsedSeconds > 0 ? loaded / elapsedSeconds : 0;

            // 检测进度是否异常回退
            if (loaded < lastLoaded) {
              this.logger.warn(
                `下载进度异常: ${this.formatBytes(
                  lastLoaded
                )} -> ${this.formatBytes(loaded)}`
              );
            }
            lastLoaded = loaded;

            this.notifyProgress('download', {
              percent,
              transferred: loaded,
              total,
            });

            this.logger.info(
              `下载进度: ${percent}% (${this.formatBytes(
                loaded
              )}/${this.formatBytes(total)}) 速度: ${this.formatBytes(speed)}/s`
            );
          }
        },
      })
        .then(response => {
          const writer = fsSync.createWriteStream(filePath);

          response.data.pipe(writer);

          writer.on('finish', () => {
            cleanup();
            this.logger.info(`下载完成: ${filePath}`);

            // 验证文件大小
            try {
              const stats = fsSync.statSync(filePath);
              const contentLength = response.headers['content-length']
                ? parseInt(response.headers['content-length'])
                : 0;

              if (contentLength > 0 && stats.size !== contentLength) {
                this.logger.error(
                  `文件大小不匹配: 期望 ${contentLength} 字节, 实际 ${stats.size} 字节`
                );
                reject(new Error('下载文件大小不匹配，可能下载不完整'));
                return;
              }
            } catch (err) {
              this.logger.warn(`检查文件大小失败: ${err}`);
            }

            this.notifyProgress('downloaded', {
              percent: 100,
              transferred: response.headers['content-length']
                ? parseInt(response.headers['content-length'])
                : 0,
              total: response.headers['content-length']
                ? parseInt(response.headers['content-length'])
                : 0,
            });
            resolve();
          });

          writer.on('error', err => {
            cleanup();
            this.logger.error(`文件写入错误: ${err.message}`);
            reject(err);
          });

          response.data.on('error', (err: Error) => {
            cleanup();
            this.logger.error(`数据流错误: ${err.message}`);
            reject(err);
          });
        })
        .catch(error => {
          cleanup();
          this.logger.error(`下载请求错误: ${error.message}`);
          reject(error);
        });
    });
  }

  private async calculateSHA512(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha512');
      const stream = fsSync.createReadStream(filePath);

      stream.on('data', data => {
        hash.update(data);
      });

      stream.on('end', () => {
        resolve(hash.digest('base64'));
      });

      stream.on('error', reject);
    });
  }

  private openInstallPack(saveFilePath: string): void {
    this.logger.info(`打开安装包: ${saveFilePath}`);

    if (isWindows) {
      spawn('cmd', ['/s', '/c', saveFilePath], {
        detached: true,
        windowsVerbatimArguments: true,
        stdio: 'ignore',
      });
    } else if (isMac) {
      spawn('open', [saveFilePath], {
        detached: true,
        windowsVerbatimArguments: true,
        stdio: 'ignore',
      });
    } else if (isLinux) {
      spawn('chmod', ['+x', saveFilePath]).on('close', () => {
        spawn(saveFilePath, [], {
          detached: true,
          stdio: 'ignore',
        });
      });
    }
    app.quit();
  }

  async getDownloadsPath(): Promise<string> {
    const downloadsDir = path.join(app.getPath('downloads'), 'app-updates');
    await fs.mkdir(downloadsDir, { recursive: true });
    return downloadsDir;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private async getLatestVersionFromServer(
    serverUrl: string,
    platform: string
  ): Promise<VersionInfo> {
    try {
      // 根据平台确定配置文件名
      let configFileName: string;
      if (isMac) {
        configFileName = 'latest-mac.yml';
      } else if (isLinux) {
        configFileName = 'latest-linux.yml';
      } else if (isWindows) {
        configFileName = 'latest.yml';
      } else {
        throw new Error(`不支持的平台: ${platform}`);
      }

      // 获取配置文件
      const configUrl = `${serverUrl}/${configFileName}`;
      this.logger.info(`获取配置文件: ${configUrl}`);

      const response = await axios.get(configUrl, {
        timeout: this.timeout,
        responseType: 'text',
      });

      // 解析YAML配置
      let config: YamlConfig;
      try {
        config = YAML.parse(response.data) as YamlConfig;
        this.logger.info('YAML配置解析成功:', config);
      } catch (parseError) {
        this.logger.error('YAML解析失败:', parseError);
        throw new Error(`YAML配置文件格式错误: ${parseError}`);
      }

      return {
        version: config.version,
        fileName: config.path || config.files?.[0]?.url || '',
        sha512: config.files?.[0]?.sha512,
        fileSize: config.files?.[0]?.size,
      };
    } catch (error) {
      this.logger.warn('获取最新版本失败，使用默认版本:', error);
      return {
        version: '0.0.0',
        fileName: '',
        sha512: '',
        fileSize: 0,
      };
    }
  }

  private notifyProgress(
    type: UpgradeProgressType,
    progress: UpdateProgress
  ): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('UPGRADE_PROGRESS', {
        type,
        progress,
      });
    }
  }


}
