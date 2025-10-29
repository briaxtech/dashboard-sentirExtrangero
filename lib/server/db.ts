import { Client, type ClientConfig } from 'pg';

import config from './config';

function buildClientConfig(): ClientConfig {
  const { connectionString, host, port, user, password, database, ssl } = config.db;

  const sslConfig = ssl ? { rejectUnauthorized: false } : undefined;

  if (connectionString) {
    return {
      connectionString,
      ssl: sslConfig,
    };
  }

  return {
    host,
    port,
    user,
    password,
    database,
    ssl: sslConfig,
  };
}

export function createDbClient() {
  return new Client(buildClientConfig());
}

export async function pingDatabase() {
  const client = createDbClient();

  try {
    await client.connect();
    await client.query('SELECT 1');
  } finally {
    await client.end();
  }
}
