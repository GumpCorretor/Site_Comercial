export interface WebEnvironment {
  VITE_API_URL: string;
}

export class WebEnvironmentError extends Error {
  constructor(variable: keyof WebEnvironment, reason: string) {
    super(`[web] Invalid environment configuration:\n- ${variable}: ${reason}`);
    this.name = 'WebEnvironmentError';
  }
}

export function parseWebEnvironment(
  input: Readonly<Record<string, string | undefined>>,
): WebEnvironment {
  const value = input.VITE_API_URL;

  if (value === undefined || value.trim() === '') {
    throw new WebEnvironmentError('VITE_API_URL', 'is required.');
  }

  try {
    const url = new URL(value);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new WebEnvironmentError(
        'VITE_API_URL',
        'must be an absolute URL using http:// or https://.',
      );
    }
  } catch (error: unknown) {
    if (error instanceof WebEnvironmentError) {
      throw error;
    }

    throw new WebEnvironmentError(
      'VITE_API_URL',
      'must be an absolute URL using http:// or https://.',
    );
  }

  return { VITE_API_URL: value };
}
