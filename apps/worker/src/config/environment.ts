const nodeEnvironments = ['development', 'test', 'production'] as const;

type NodeEnvironment = (typeof nodeEnvironments)[number];

export interface WorkerEnvironment {
  NODE_ENV: NodeEnvironment;
  DATABASE_URL: string;
}

interface EnvironmentIssue {
  variable: keyof WorkerEnvironment;
  reason: string;
}

export class WorkerEnvironmentError extends Error {
  constructor(readonly issues: readonly EnvironmentIssue[]) {
    super(
      [
        '[worker] Invalid environment configuration:',
        ...issues.map(({ variable, reason }) => `- ${variable}: ${reason}`),
      ].join('\n'),
    );
    this.name = 'WorkerEnvironmentError';
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

export function parseWorkerEnvironment(input: NodeJS.ProcessEnv): WorkerEnvironment {
  const issues: EnvironmentIssue[] = [];
  const NODE_ENV = parseNodeEnvironment(input.NODE_ENV, issues);
  const DATABASE_URL = parseDatabaseUrl(input.DATABASE_URL, issues);

  if (issues.length > 0 || NODE_ENV === undefined || DATABASE_URL === undefined) {
    throw new WorkerEnvironmentError(issues);
  }

  return { NODE_ENV, DATABASE_URL };
}
