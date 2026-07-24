const nodeEnvironments = ['development', 'test', 'production'] as const;

type NodeEnvironment = (typeof nodeEnvironments)[number];

export interface ApiEnvironment {
  NODE_ENV: NodeEnvironment;
  PORT: number;
  DATABASE_URL: string;
}

interface EnvironmentIssue {
  variable: keyof ApiEnvironment;
  reason: string;
}

export class ApiEnvironmentError extends Error {
  constructor(readonly issues: readonly EnvironmentIssue[]) {
    super(
      [
        '[api] Invalid environment configuration:',
        ...issues.map(({ variable, reason }) => `- ${variable}: ${reason}`),
      ].join('\n'),
    );
    this.name = 'ApiEnvironmentError';
  }
}

function parseNodeEnvironment(
  value: string | undefined,
  issues: EnvironmentIssue[],
): NodeEnvironment | undefined {
  if (value === undefined || value.trim() === '') {
    issues.push({ variable: 'NODE_ENV', reason: 'is required.' });
    return undefined;
  }

  if (!nodeEnvironments.includes(value as NodeEnvironment)) {
    issues.push({
      variable: 'NODE_ENV',
      reason: 'must be development, test, or production.',
    });
    return undefined;
  }

  return value as NodeEnvironment;
}

function parsePort(value: string | undefined, issues: EnvironmentIssue[]): number | undefined {
  if (value === undefined) {
    return 3001;
  }

  if (value.trim() === '') {
    issues.push({
      variable: 'PORT',
      reason: 'must be an integer between 1 and 65535.',
    });
    return undefined;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    issues.push({
      variable: 'PORT',
      reason: 'must be an integer between 1 and 65535.',
    });
    return undefined;
  }

  return port;
}

function parseDatabaseUrl(
  value: string | undefined,
  issues: EnvironmentIssue[],
): string | undefined {
  if (value === undefined || value.trim() === '') {
    issues.push({ variable: 'DATABASE_URL', reason: 'is required.' });
    return undefined;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== 'postgresql:' && url.protocol !== 'postgres:') {
      issues.push({
        variable: 'DATABASE_URL',
        reason: 'must use the postgresql:// or postgres:// protocol.',
      });
      return undefined;
    }
  } catch {
    issues.push({
      variable: 'DATABASE_URL',
      reason: 'must be a valid PostgreSQL URL.',
    });
    return undefined;
  }

  return value;
}

export function parseApiEnvironment(input: NodeJS.ProcessEnv): ApiEnvironment {
  const issues: EnvironmentIssue[] = [];
  const NODE_ENV = parseNodeEnvironment(input.NODE_ENV, issues);
  const PORT = parsePort(input.PORT, issues);
  const DATABASE_URL = parseDatabaseUrl(input.DATABASE_URL, issues);

  if (
    issues.length > 0 ||
    NODE_ENV === undefined ||
    PORT === undefined ||
    DATABASE_URL === undefined
  ) {
    throw new ApiEnvironmentError(issues);
  }

  return { NODE_ENV, PORT, DATABASE_URL };
}
