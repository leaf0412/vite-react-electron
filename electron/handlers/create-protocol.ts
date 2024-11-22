import { protocol } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { URL } from 'node:url';
import { Readable } from 'stream';
import { __dirname } from '@electron/config/constant';

export const defaultScheme = 'myapp';

export const registerProtocol = (
  scheme = defaultScheme,
  customProtocol = protocol
) => {
  customProtocol.registerSchemesAsPrivileged([
    { scheme, privileges: { secure: true, standard: true, corsEnabled: true } },
  ]);
};

const createProtocol = (scheme = defaultScheme, customProtocol = protocol) => {
  customProtocol.handle(scheme, async request => {
    const url = new URL(request.url);
    const pathName = decodeURI(url.pathname);
    const filePath = path.resolve(path.join(__dirname, '../', pathName));

    try {
      await fs.promises.access(filePath, fs.constants.R_OK);
    } catch (err) {
      console.error(`Failed to read ${pathName} on ${scheme} protocol`, err);
      return new Response('Not Found', { status: 404 });
    }

    const extension = path.extname(pathName).toLowerCase();
    const mimeType =
      (
        {
          '.js': 'text/javascript',
          '.html': 'text/html',
          '.css': 'text/css',
          '.svg': 'image/svg+xml',
          '.svgz': 'image/svg+xml',
          '.json': 'application/json',
          '.wasm': 'application/wasm',
        } as const
      )[extension] || '';

    const fileStream = fs.createReadStream(filePath);
    const webReadableStream = Readable.toWeb(
      fileStream
    ) as ReadableStream<Uint8Array>;

    return new Response(webReadableStream, {
      status: 200,
      headers: { 'content-type': mimeType },
    });
  });
};

export const unProtocol = (
  scheme = defaultScheme,
  customProtocol = protocol
) => {
  customProtocol.unhandle(scheme);
};

export default createProtocol;
