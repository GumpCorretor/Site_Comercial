import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/create-app';

const databaseHealthCheck = { check: async () => undefined };

describe('API scaffold', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createApp({
      databaseUrl: 'postgresql://postgres:postgres@localhost:5432/central_comercial',
      databaseHealthCheck,
    });
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('inicia com Fastify e expõe o endpoint mínimo', async () => {
    const response = await app.getHttpAdapter().getInstance().inject({
      method: 'GET',
      url: '/',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ message: 'Central Comercial API' });
  });

  it('publica o documento OpenAPI dos endpoints', async () => {
    const response = await app.getHttpAdapter().getInstance().inject({
      method: 'GET',
      url: '/docs-json',
    });
    const document = response.json<{ paths: Record<string, unknown> }>();

    expect(response.statusCode).toBe(200);
    expect(document.paths['/']).toBeDefined();
    expect(document.paths['/health']).toBeDefined();
  });
});
