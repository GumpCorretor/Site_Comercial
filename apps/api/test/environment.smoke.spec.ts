import { describe, expect, it, vi } from 'vitest';

import { parseApiEnvironment } from '../src/config/environment';
import { startApi } from '../src/start-api';

const validDatabaseUrl = 'postgresql://postgres:postgres@localhost:5432/central_comercial';

describe('API environment', () => {
  it('usa a porta 3001 quando PORT não está definida', () => {
    const environment = parseApiEnvironment({
      NODE_ENV: 'development',
      DATABASE_URL: validDatabaseUrl,
    });

    expect(environment.PORT).toBe(3001);
  });

  it('rejeita DATABASE_URL ausente antes de criar a aplicação', async () => {
    const appFactory = vi.fn(async () => {
      throw new Error('The API application must not be created.');
    });

    await expect(
      startApi(
        {
          NODE_ENV: 'development',
        },
        appFactory,
      ),
    ).rejects.toThrow(/\[api\][\s\S]*DATABASE_URL: is required\./);

    expect(appFactory).not.toHaveBeenCalled();
  });

  it('rejeita NODE_ENV inválido com uma mensagem explícita', () => {
    expect(() =>
      parseApiEnvironment({
        NODE_ENV: 'staging',
        DATABASE_URL: validDatabaseUrl,
      }),
    ).toThrow(/\[api\][\s\S]*NODE_ENV: must be development, test, or production\./);
  });
});
