import { Pool, type QueryResultRow } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL no esta configurada');
}

// Reutiliza un unico pool durante hot-reloads en desarrollo.
const globalForPool = globalThis as unknown as { pgPool?: Pool };

export const pgPool =
  globalForPool.pgPool ??
  new Pool({
    connectionString,
    ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPool.pgPool = pgPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const { rows } = await pgPool.query<T>(text, params);
  return rows;
}
