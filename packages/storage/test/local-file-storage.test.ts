import { mkdtemp, readFile, rm, symlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { afterEach, describe, expect, it } from 'vitest';

import { LocalFileStorage } from '../src/index';

const temporaryDirectories: string[] = [];

async function createStorage(): Promise<{
  baseDirectory: string;
  storage: LocalFileStorage;
}> {
  const baseDirectory = await mkdtemp(join(tmpdir(), 'repo-storage-'));
  temporaryDirectories.push(baseDirectory);

  return {
    baseDirectory,
    storage: new LocalFileStorage({ baseDirectory }),
  };
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe('LocalFileStorage', () => {
  it('executes put → exists(true) → get → delete → exists(false)', async () => {
    const { storage } = await createStorage();
    const key = 'documents/proposal.txt';
    const data = Buffer.from('proposal-content');

    await storage.put(key, data);

    await expect(storage.exists(key)).resolves.toBe(true);
    await expect(storage.get(key)).resolves.toEqual(data);

    await storage.delete(key);

    await expect(storage.exists(key)).resolves.toBe(false);
  });

  it('overwrites existing content on put', async () => {
    const { baseDirectory, storage } = await createStorage();
    const key = 'documents/proposal.txt';

    await storage.put(key, Buffer.from('old-content'));
    await storage.put(key, Buffer.from('new-content'));

    await expect(storage.get(key)).resolves.toEqual(Buffer.from('new-content'));
    await expect(readFile(join(baseDirectory, key))).resolves.toEqual(Buffer.from('new-content'));
  });

  it('throws a clear error when get receives a missing key', async () => {
    const { storage } = await createStorage();

    await expect(storage.get('missing.txt')).rejects.toThrow(
      '[storage] File not found for key "missing.txt".',
    );
  });

  it('keeps delete idempotent for a missing key', async () => {
    const { storage } = await createStorage();

    await expect(storage.delete('missing.txt')).resolves.toBeUndefined();
    await expect(storage.delete('missing.txt')).resolves.toBeUndefined();
  });

  it('rejects a symbolic link inside the storage path', async () => {
    const { baseDirectory, storage } = await createStorage();
    const targetDirectory = await mkdtemp(join(tmpdir(), 'central-storage-target-'));
    temporaryDirectories.push(targetDirectory);

    await symlink(
      targetDirectory,
      join(baseDirectory, 'linked'),
      process.platform === 'win32' ? 'junction' : 'dir',
    );

    await expect(storage.put('linked/blocked.txt', Buffer.from('blocked'))).rejects.toThrow(
      /\[storage\] Refusing to access symbolic link/,
    );
  });

  it('rejects a symbolic link used as the base directory', async () => {
    const parentDirectory = await mkdtemp(join(tmpdir(), 'central-storage-parent-'));
    const targetDirectory = await mkdtemp(join(tmpdir(), 'central-storage-target-'));
    temporaryDirectories.push(parentDirectory, targetDirectory);
    const linkedBaseDirectory = join(parentDirectory, 'storage');

    await symlink(
      targetDirectory,
      linkedBaseDirectory,
      process.platform === 'win32' ? 'junction' : 'dir',
    );

    const storage = new LocalFileStorage({ baseDirectory: linkedBaseDirectory });

    await expect(storage.put('blocked.txt', Buffer.from('blocked'))).rejects.toThrow(
      /\[storage\] Refusing to access symbolic link/,
    );
    await expect(readFile(join(targetDirectory, 'blocked.txt'))).rejects.toMatchObject({
      code: 'ENOENT',
    });
  });

  it.each([
    '../outside.txt',
    'nested/../../outside.txt',
    '..\\outside.txt',
    '/absolute.txt',
    'C:\\absolute.txt',
  ])('rejects unsafe key %s', async (key) => {
    const { storage } = await createStorage();

    await expect(storage.put(key, Buffer.from('blocked'))).rejects.toThrow(
      /\[storage\] Invalid key/,
    );
  });
});
