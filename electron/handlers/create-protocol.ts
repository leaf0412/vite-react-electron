import { protocol, app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { URL } from 'node:url';

export const defaultScheme = 'myapp';

interface ProtocolOptions {
  scheme?: string;
  directory?: {
    isSameDirectory: boolean;
    name: string;
  };
}

export const registerProtocol = (scheme = defaultScheme): void => {
  protocol.registerSchemesAsPrivileged([
    {
      scheme,
      privileges: {
        secure: true,
        standard: true,
        corsEnabled: true,
        supportFetchAPI: true,
      },
    },
  ]);
};

const normalizePath = (
  urlPath: string,
  directory: { isSameDirectory: boolean; name: string }
): string => {
  const decodedPath = decodeURI(urlPath)
    .replace(/^\//, '')
    .replace(/\/$/, '');

  if (directory.isSameDirectory) {
    if (decodedPath.startsWith(directory.name)) {
      if (decodedPath === directory.name) {
        const result = path.join(decodedPath, 'index.html');
        return result;
      }
      return decodedPath;
    }
    if (decodedPath === '') {
      const result = path.join(directory.name, 'index.html');
      return result;
    }
    const result = path.join(directory.name, decodedPath);
    return result;
  }

  return decodedPath;
};

export const createProtocol = ({
  scheme = defaultScheme,
  directory = {
    isSameDirectory: false,
    name: 'dist',
  },
}: ProtocolOptions): void => {
  protocol.registerFileProtocol(scheme, async (request, callback) => {
    try {
      const requestUrl = new URL(request.url);
      const urlPath = normalizePath(requestUrl.pathname, directory);
      let basePath;
      if (process.env.NODE_ENV === 'development') {
        basePath = process.cwd();
      } else {
        basePath = app.getAppPath();
      }
      const filePath = path.resolve(basePath, urlPath);

      await fs.promises.access(filePath, fs.constants.R_OK);
      callback(filePath);
    } catch (error) {
      callback({ error: -2 });
    }
  });
};

export const unregisterProtocol = (scheme = defaultScheme): void => {
  protocol.unregisterProtocol(scheme);
};

export default createProtocol;
