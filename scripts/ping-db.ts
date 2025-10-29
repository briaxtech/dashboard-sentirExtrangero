import { loadEnv } from './utils/load-env';

async function main() {
  loadEnv();

  const { pingDatabase } = await import('../lib/server/db');

  try {
    await pingDatabase();
    console.log('Connection to the database succeeded.');
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed.');
    console.log('Variables de entorno usadas:');
    console.table({
      DATABASE_URL: process.env.DATABASE_URL,
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
    });
    console.error(error);
    process.exit(1);
  }
}

void main();
