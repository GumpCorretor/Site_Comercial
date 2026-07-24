import { describe, expect, it } from 'vitest';

import { parseWebEnvironment } from '../../environment.schema.js';

describe('web environment', () => {
  it('aceita uma VITE_API_URL HTTP válida', () => {
    expect(
      parseWebEnvironment({
        VITE_API_URL: 'http://localhost:3001',
      }),
    ).toEqual({ VITE_API_URL: 'http://localhost:3001' });
  });

  it('rejeita VITE_API_URL ausente', () => {
    expect(() => parseWebEnvironment({})).toThrow(/\[web\][\s\S]*VITE_API_URL: is required\./);
  });

  it('rejeita VITE_API_URL inválida', () => {
    expect(() =>
      parseWebEnvironment({
        VITE_API_URL: 'api-local',
      }),
    ).toThrow(/\[web\][\s\S]*VITE_API_URL: must be an absolute URL/);
  });
});
