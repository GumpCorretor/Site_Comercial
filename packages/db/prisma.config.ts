import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { defineConfig, env } from 'prisma/config';

const workspaceEnvironmentPath = resolve(__dirname, '../..', '.env');

if (existsSync(workspaceEnvironmentPath)) {
  process.loadEnvFile(workspaceEnvironmentPath);
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
