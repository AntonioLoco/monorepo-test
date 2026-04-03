// oxlint-disable no-console
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import { Client } from 'pg';
const MS = 1000;

const env = config({
  path: '.env',
});
expand(env);

if (!process.env.DATABASE_URI) {
  console.error('❌ Error: DATABASE_URI is not defined.');
  process.exit(1);
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const waitForDatabase = async (
  delayMs = 2000,
  maxRetries?: number,
): Promise<void> => {
  console.log(`⏳ Connection string found. Checking database health...`);

  for (let attempt = 1; !maxRetries || attempt <= maxRetries; attempt++) {
    const client = new Client({ connectionString: process.env.DATABASE_URI });

    try {
      await client.connect();
      await client.query('SELECT 1');

      await client.end();
      console.log('✅ Database is ready to accept connections.');
      process.exit(0);
    } catch {
      await client.end().catch(() => {});

      console.log(
        `[Attempt ${attempt}${maxRetries ? `/${maxRetries}` : ''}] Retrying in ${delayMs / MS}s...`,
      );
      await sleep(delayMs);
    }
  }

  console.error('❌ Timeout: Could not connect to the database.');
  process.exit(1);
};

// oxlint-disable-next-line typescript/no-floating-promises
waitForDatabase();
