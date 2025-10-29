import { stdin as input, stdout as output } from 'node:process';
import readline from 'node:readline/promises';

import type { Client } from 'pg';

import { loadEnv } from './utils/load-env';

type DbClient = Client;

interface TableEntry {
  schemaname: string;
  tablename: string;
}

interface ResetOptions {
  force: boolean;
  dryRun: boolean;
}

function parseArgs(): ResetOptions {
  const args = new Set(process.argv.slice(2));
  return {
    force: args.has('--force'),
    dryRun: args.has('--dry-run'),
  };
}

function quoteIdentifier(identifier: string) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

async function fetchUserTables(client: DbClient): Promise<TableEntry[]> {
  const query = `
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      AND schemaname NOT LIKE 'pg_toast%'
      AND schemaname NOT LIKE 'pg_temp_%'
    ORDER BY schemaname, tablename
  `;

  const result = await client.query<TableEntry>(query);
  return result.rows;
}

function formatTableName(entry: TableEntry) {
  return `${entry.schemaname}.${entry.tablename}`;
}

function buildTruncateStatement(tables: TableEntry[]) {
  const identifiers = tables.map(
    (table) => `${quoteIdentifier(table.schemaname)}.${quoteIdentifier(table.tablename)}`,
  );
  return `TRUNCATE TABLE ${identifiers.join(', ')} RESTART IDENTITY CASCADE;`;
}

async function confirmReset(tables: TableEntry[], force: boolean) {
  if (force) {
    return true;
  }

  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(
    `Se truncaran ${tables.length} tablas. Escribe "yes" para continuar: `,
  );
  rl.close();

  return answer.trim().toLowerCase() === 'yes';
}

async function truncateTables(client: DbClient, tables: TableEntry[]) {
  const statement = buildTruncateStatement(tables);

  await client.query('BEGIN');

  try {
    await client.query(statement);
    await client.query('COMMIT');
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Fallo al revertir la transaccion:', rollbackError);
    }
    throw error;
  }
}

async function main() {
  loadEnv();

  const { createDbClient } = await import('../lib/server/db');
  const client = createDbClient();
  const { force, dryRun } = parseArgs();

  try {
    await client.connect();
    const tables = await fetchUserTables(client);

    if (tables.length === 0) {
      console.log('No se encontraron tablas para truncar.');
      return;
    }

    console.log('Tablas detectadas:');
    for (const table of tables) {
      console.log(` - ${formatTableName(table)}`);
    }

    if (dryRun) {
      console.log('Modo dry-run activado. No se ejecuto ningun comando TRUNCATE.');
      return;
    }

    const confirmed = await confirmReset(tables, force);

    if (!confirmed) {
      console.log('Operacion cancelada por el usuario.');
      return;
    }

    await truncateTables(client, tables);
    console.log('Todas las tablas fueron truncadas exitosamente (identificadores reiniciados).');
  } catch (error) {
    console.error('Error al resetear la base de datos:');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

void main();
