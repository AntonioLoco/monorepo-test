import { PostgresDialect } from 'kysely';
import { defineConfig } from 'kysely-ctl';
import { Pool } from 'pg';

if (!process.env.DATABASE_URI) {
  console.error('❌ Error: DATABASE_URI is not defined.');
  process.exit(1);
}

export default defineConfig({
  // le proprietà #private tra le diverse build della libreria.
  // È un problema noto di Kysely che non inficia il runtime.
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URI,
    }),
  }),
  migrations: {
    migrationFolder: 'migrations',
  },
  seeds: {
    seedFolder: 'seeds',
  },
});
