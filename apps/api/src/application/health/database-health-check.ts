export const DATABASE_HEALTH_CHECK = Symbol('DATABASE_HEALTH_CHECK');

export interface DatabaseHealthCheck {
  check(): Promise<void>;
}
