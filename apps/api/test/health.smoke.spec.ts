import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../src/create-app';

const databaseUrl = 'postgresql://postgres:postgres@localhost:5432/central_comercial';

async function createTestApp(check: () => Promise<void>) {
  const app = await createApp({
    databaseUrl,
    databaseHealthCheck: { check },
  });

  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}

describe('GET /health', () => {
  let app: NestFastifyApplication | undefined;

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  it('retorna 200 quando o PostgreSQL responde', async () => {
    const check = vi.fn(async () => undefined);
    app = await createTestApp(check);

    const response = await app.getHttpAdapter().getInstance().inject({
      method: 'GET',
      url: '/health',
    });

    expect(check).toHaveBeenCalledOnce();
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok', database: 'up' });
  });

  it('retorna 503 e mantém a API ativa quando o PostgreSQL falha', async () => {
    const check = vi.fn(async () => {
      throw new Error('connection refused');
    });
    app = await createTestApp(check);

    const healthResponse = await app.getHttpAdapter().getInstance().inject({
      method: 'GET',
      url: '/health',
    });
    const rootResponse = await app.getHttpAdapter().getInstance().inject({
      method: 'GET',
      url: '/',
    });

    expect(check).toHaveBeenCalledOnce();
    expect(healthResponse.statusCode).toBe(503);
    expect(healthResponse.json()).toMatchObject({
      statusCode: 503,
      error: 'Service Unavailable',
      message: 'Database unavailable',
      path: '/health',
    });
    expect(rootResponse.statusCode).toBe(200);
  });

  it('padroniza erros HTTP intencionais sem expor detalhes internos', async () => {
    app = await createTestApp(async () => undefined);

    const response = await app.getHttpAdapter().getInstance().inject({
      method: 'GET',
      url: '/missing',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      statusCode: 404,
      error: 'Not Found',
      message: 'Cannot GET /missing',
      path: '/missing',
    });
  });
});
