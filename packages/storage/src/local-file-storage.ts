import { access, lstat, mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, posix, relative, resolve, sep, win32 } from 'node:path';

import type { FileStorage } from './file-storage.js';

export interface LocalFileStorageOptions {
  baseDirectory: string;
}

export class LocalFileStorage implements FileStorage {
  private readonly baseDirectory: string;

  constructor(options: LocalFileStorageOptions) {
    if (
      options === undefined ||
      typeof options.baseDirectory !== 'string' ||
      options.baseDirectory.trim() === ''
    ) {
      throw new Error('[storage] baseDirectory must be a non-empty string.');
    }

    this.baseDirectory = resolve(options.baseDirectory);
  }

  async put(key: string, data: Buffer): Promise<void> {
    const filePath = this.resolveKey(key);

    await this.assertNoSymbolicLink(filePath);
    await mkdir(dirname(filePath), { recursive: true });
    await this.assertNoSymbolicLink(filePath);
    await writeFile(filePath, data);
  }

  async get(key: string): Promise<Buffer> {
    const filePath = this.resolveKey(key);

    await this.assertNoSymbolicLink(filePath);

    try {
      return await readFile(filePath);
    } catch (error: unknown) {
      if (hasErrorCode(error, 'ENOENT')) {
        throw new Error(`[storage] File not found for key "${key}".`, {
          cause: error,
        });
      }

      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    const filePath = this.resolveKey(key);

    await this.assertNoSymbolicLink(filePath);

    try {
      await unlink(filePath);
    } catch (error: unknown) {
      if (!hasErrorCode(error, 'ENOENT')) {
        throw error;
      }
    }
  }

  async exists(key: string): Promise<boolean> {
    const filePath = this.resolveKey(key);

    await this.assertNoSymbolicLink(filePath);

    try {
      await access(filePath);
      return true;
    } catch (error: unknown) {
      if (hasErrorCode(error, 'ENOENT')) {
        return false;
      }

      throw error;
    }
  }

  private resolveKey(key: string): string {
    if (typeof key !== 'string' || key.trim() === '') {
      throw invalidKeyError(key, 'must be a non-empty string');
    }

    if (key.includes('\0')) {
      throw invalidKeyError(key, 'must not contain null bytes');
    }

    const portableKey = key.replaceAll('\\', '/');
    const segments = portableKey.split('/');

    if (
      posix.parse(portableKey).root !== '' ||
      win32.parse(key).root !== '' ||
      segments.some((segment) => segment === '' || segment === '.' || segment === '..')
    ) {
      throw invalidKeyError(
        key,
        'must be a relative path without empty, current, or parent segments',
      );
    }

    const filePath = resolve(this.baseDirectory, ...segments);
    const relativePath = relative(this.baseDirectory, filePath);

    if (
      relativePath === '' ||
      relativePath === '..' ||
      relativePath.startsWith(`..${sep}`) ||
      isAbsolute(relativePath)
    ) {
      throw invalidKeyError(key, 'must stay inside the base directory');
    }

    return filePath;
  }

  private async assertNoSymbolicLink(filePath: string): Promise<void> {
    const relativePath = relative(this.baseDirectory, filePath);
    const segments = relativePath.split(sep);
    let currentPath = this.baseDirectory;

    await assertPathIsNotSymbolicLink(currentPath);

    for (const segment of segments) {
      currentPath = join(currentPath, segment);
      await assertPathIsNotSymbolicLink(currentPath);
    }
  }
}

async function assertPathIsNotSymbolicLink(path: string): Promise<void> {
  try {
    const stats = await lstat(path);

    if (stats.isSymbolicLink()) {
      throw new Error(`[storage] Refusing to access symbolic link in storage path: "${path}".`);
    }
  } catch (error: unknown) {
    if (hasErrorCode(error, 'ENOENT')) {
      return;
    }

    throw error;
  }
}

function invalidKeyError(key: unknown, reason: string): Error {
  return new Error(`[storage] Invalid key "${String(key)}": ${reason}.`);
}

function hasErrorCode(error: unknown, expectedCode: string): error is NodeJS.ErrnoException {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === expectedCode
  );
}
