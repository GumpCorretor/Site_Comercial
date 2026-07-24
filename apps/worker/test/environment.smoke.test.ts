import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { describe, expect, it, vi } from 'vitest';

import { parseWorkerEnvironment } from '../src/config/environment.js';
import { startWorkerProcess } from '../src/start-worker-process.js';

const workspaceDirectory = fileURLToPath(new URL('../', import.meta.url));
const validDatabaseUrl = 'postgresql://postgres:postgres@localhost:5432/central_comercial';

interface ProcessResult {
  code: number | null;
  stderr: string;
  stdout: string;
}

async function runWorker(environment: NodeJS.ProcessEnv): Promise<ProcessResult> {
  const child = spawn(process.execPath, ['--import', 'tsx', 'src/index.ts'], {
    cwd: workspaceDirectory,
    env: environment,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (chunk: string) => {
    stdout += chunk;
  });
  child.stderr.on('data', (chunk: string) => {
    stderr += chunk;
  });

  const code = await new Promise<number | null>((resolve, reject) => {
    child.once('error', reject);
    child.once('close', resolve);
  });

  return { code, stderr, stdout };
}

describe('worker environment', () => {
  it('rejeita DATABASE_URL ausente antes de iniciar o worker', () => {
    const workerStarter = vi.fn(() => {
      throw new Error('The worker must not start.');
    });

    expect(() =>
      startWorkerProcess(
        {
          NODE_ENV: 'development',
        },
        workerStarter,
      ),
    ).toThrow(/\[worker\][\s\S]*DATABASE_URL: is required\./);

    expect(workerStarter).not.toHaveBeenCalled();
  });

  it('rejeita NODE_ENV inválido com uma mensagem explícita', () => {
    expect(() =>
      parseWorkerEnvironment({
        NODE_ENV: 'staging',
        DATABASE_URL: validDatabaseUrl,
      }),
    ).toThrow(/\[worker\][\s\S]*NODE_ENV: must be development, test, or production\./);
  });

  it('encerra com código de erro sem iniciar a rotina quando DATABASE_URL está ausente', async () => {
    const environment: NodeJS.ProcessEnv = {
      ...process.env,
      NODE_ENV: 'development',
    };
    delete environment.DATABASE_URL;

    const result = await runWorker(environment);

    expect(result.code).toBe(1);
    expect(result.stdout).not.toContain('Worker started.');
    expect(result.stderr).toMatch(/\[worker\][\s\S]*DATABASE_URL: is required\./);
  });
});
