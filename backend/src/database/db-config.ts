import type { ClientConfig, PoolConfig } from 'pg';

type DatabaseEnv = {
  [key: string]: string | undefined;
  DATABASE_URL?: string;
  DB_MODE?: string;
  DB_SSL?: string;
  DB_SSL_REJECT_UNAUTHORIZED?: string;
  DATABASE_SSL?: string;
  DATABASE_SSL_REJECT_UNAUTHORIZED?: string;
  DATABASE_POOL_MAX?: string;
  DATABASE_POOL_IDLE_TIMEOUT_MS?: string;
  DATABASE_POOL_CONN_TIMEOUT_MS?: string;
};

const DEFAULT_DATABASE_URL = 'postgresql://dietapp:dietapp@localhost:5433/dietapp';

const TRUE_VALUES = new Set(['true', '1', 'yes', 'y']);
const FALSE_VALUES = new Set(['false', '0', 'no', 'n']);

const parseBoolean = (value?: string): boolean | undefined => {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (TRUE_VALUES.has(normalized)) return true;
  if (FALSE_VALUES.has(normalized)) return false;
  return undefined;
};

const parseNumber = (value?: string): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const resolveSslConfig = (
  env: DatabaseEnv,
): { ssl?: boolean | { rejectUnauthorized: boolean } } => {
  const mode = env.DB_MODE?.toLowerCase();
  const sslFlag = parseBoolean(env.DB_SSL ?? env.DATABASE_SSL);
  const useSsl = sslFlag ?? (mode === 'neon' ? true : false);

  if (!useSsl) {
    return {};
  }

  const rejectUnauthorized =
    parseBoolean(env.DB_SSL_REJECT_UNAUTHORIZED ?? env.DATABASE_SSL_REJECT_UNAUTHORIZED) ?? true;
  return { ssl: { rejectUnauthorized } };
};

const resolveConnectionString = (env: DatabaseEnv): string =>
  env.DATABASE_URL ?? DEFAULT_DATABASE_URL;

export const buildClientConfig = (env: DatabaseEnv): ClientConfig => {
  const base = resolveSslConfig(env);
  return {
    connectionString: resolveConnectionString(env),
    ...base,
  };
};

export const buildPoolConfig = (env: DatabaseEnv): PoolConfig => {
  const base = resolveSslConfig(env);
  const max = parseNumber(env.DATABASE_POOL_MAX);
  const idleTimeoutMillis = parseNumber(env.DATABASE_POOL_IDLE_TIMEOUT_MS);
  const connectionTimeoutMillis = parseNumber(env.DATABASE_POOL_CONN_TIMEOUT_MS);

  return {
    connectionString: resolveConnectionString(env),
    ...base,
    ...(max ? { max } : {}),
    ...(idleTimeoutMillis ? { idleTimeoutMillis } : {}),
    ...(connectionTimeoutMillis ? { connectionTimeoutMillis } : {}),
  };
};
