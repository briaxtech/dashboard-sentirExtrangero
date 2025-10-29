import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_ENV_FILES = ['.env', '.env.local', '.env.development', '.env.development.local'] as const;

export interface LoadEnvOptions {
  envFiles?: readonly string[];
  override?: boolean;
  silent?: boolean;
}

function setEnvValue(key: string, value: string, override: boolean) {
  if (!override && key in process.env) {
    return;
  }

  process.env[key] = value;
}

function parseLine(line: string) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith('#')) {
    return null;
  }

  const separatorIndex = trimmed.indexOf('=');

  if (separatorIndex === -1) {
    return null;
  }

  const key = trimmed.slice(0, separatorIndex).trim();

  if (!key) {
    return null;
  }

  let value = trimmed.slice(separatorIndex + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return { key, value };
}

function applyEnvFromFile(fullPath: string, override: boolean) {
  if (!fs.existsSync(fullPath)) {
    return false;
  }

  const contents = fs.readFileSync(fullPath, 'utf8');
  const lines = contents.split(/\r?\n/);

  for (const line of lines) {
    const parsed = parseLine(line);

    if (!parsed) {
      continue;
    }

    setEnvValue(parsed.key, parsed.value, override);
  }

  return true;
}

export function loadEnv(options: LoadEnvOptions = {}): string[] {
  const { envFiles = DEFAULT_ENV_FILES, override = false, silent = false } = options;
  const loadedFiles: string[] = [];

  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);

    if (applyEnvFromFile(fullPath, Boolean(override))) {
      loadedFiles.push(file);
    }
  }

  if (!silent) {
    if (loadedFiles.length === 0) {
      console.warn('No se encontraron archivos .env en el proyecto.');
    } else {
      console.log(`Variables cargadas desde: ${loadedFiles.join(', ')}`);
    }
  }

  return loadedFiles;
}

export function loadEnvSilent(options: LoadEnvOptions = {}) {
  return loadEnv({ ...options, silent: true });
}
