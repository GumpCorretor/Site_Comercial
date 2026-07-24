import 'reflect-metadata';

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { startApi } from './start-api';

const workspaceEnvironmentPath = resolve(__dirname, '../../..', '.env');

if (existsSync(workspaceEnvironmentPath)) {
  process.loadEnvFile(workspaceEnvironmentPath);
}

void startApi().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
