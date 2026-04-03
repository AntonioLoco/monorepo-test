// oxlint-disable no-console
import type { DB } from '@anabolix/db';

import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

const { DATABASE_URI } = process.env;

if (!DATABASE_URI) {
  throw new Error('Database environment variables are not fully set.');
}

const globalForDb = globalThis as typeof globalThis & { db?: Kysely<DB> };

if (!globalForDb.db) {
  console.log('Creating new db instance');
} else {
  console.log('Using existing db instance');
}

globalForDb.db =
  globalForDb.db ||
  new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: DATABASE_URI,
        max: 10,
      }),
    }),
    plugins: [new CamelCasePlugin()],
  });

// oxlint-disable-next-line prefer-destructuring
export const db = globalForDb.db;
