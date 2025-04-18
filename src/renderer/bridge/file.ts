const ipcRenderer = window.ipcRenderer;

export const readDirectory = (dirPath: string) => {
  return ipcRenderer.readDirectory(dirPath);
};

export const createDirectory = (dirPath: string) => {
  return ipcRenderer.createDirectory(dirPath);
};

export const createFile = (filePath: string, content?: string) => {
  return ipcRenderer.createFile(filePath, content);
};

export const readFile = (filePath: string, encoding?: BufferEncoding) => {
  return ipcRenderer.readFile(filePath, encoding);
};

export const copyFile = (sourcePath: string, destinationPath: string) => {
  return ipcRenderer.copyFile(sourcePath, destinationPath);
};

export const moveFile = (sourcePath: string, destinationPath: string) => {
  return ipcRenderer.moveFile(sourcePath, destinationPath);
};

export const deleteFile = (targetPath: string) => {
  return ipcRenderer.deleteFile(targetPath);
};

export const getFileInfo = (targetPath: string) => {
  return ipcRenderer.getFileInfo(targetPath);
};

export const existsFile = (targetPath: string) => {
  return ipcRenderer.existsFile(targetPath);
};
