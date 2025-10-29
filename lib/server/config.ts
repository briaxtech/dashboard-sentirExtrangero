const projectDir = process.cwd();
const env = process.env.NODE_ENV || 'development';

const databaseUrl = process.env.DATABASE_URL;

const parsedDbUrl = (() => {
  if (!databaseUrl) {
    return null;
  }

  try {
    return new URL(databaseUrl);
  } catch {
    return null;
  }
})();

const parsedDbPort =
  parsedDbUrl && parsedDbUrl.port ? Number.parseInt(parsedDbUrl.port, 10) : undefined;

const parsedDbName =
  parsedDbUrl && parsedDbUrl.pathname
    ? parsedDbUrl.pathname.replace(/^\//, '') || undefined
    : undefined;

const dbSslRaw = process.env.DB_SSL ?? process.env.POSTGRES_SSL ?? 'false';
const dbSsl = dbSslRaw === 'true';

export const config = {
  projectDir,
  env,
  isDev: env === 'development',
  isProd: env === 'production',
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  db: {
    connectionString: databaseUrl || undefined,
    host: process.env.DB_HOST || parsedDbUrl?.hostname || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : parsedDbPort ?? 5432,
    user: process.env.DB_USER || parsedDbUrl?.username || 'user',
    password: process.env.DB_PASSWORD || parsedDbUrl?.password || 'password',
    database: process.env.DB_NAME || parsedDbName || 'app_db',
    ssl: dbSsl,
  },
  jwtSecret: process.env.JWT_SECRET || 'supersecretkey',
  logLevel: process.env.LOG_LEVEL || (env === 'development' ? 'debug' : 'info'),
};

export default config;
