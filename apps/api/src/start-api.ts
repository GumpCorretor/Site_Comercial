import type { NestFastifyApplication } from '@nestjs/platform-fastify';

import { createApp, type CreateAppOptions } from './create-app';
import { parseApiEnvironment } from './config/environment';

export type ApiApplicationFactory = (options: CreateAppOptions) => Promise<NestFastifyApplication>;

export async function startApi(
  environment: NodeJS.ProcessEnv = process.env,
  appFactory: ApiApplicationFactory = createApp,
): Promise<void> {
  const config = parseApiEnvironment(environment);
  const app = await appFactory({ databaseUrl: config.DATABASE_URL });

  await app.listen({
    host: '0.0.0.0',
    port: config.PORT,
  });
}
