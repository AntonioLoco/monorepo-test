import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import { spawnSync } from 'node:child_process';
import { userInfo } from 'node:os';
import { parse } from 'pg-connection-string';

const PG_PORT = 5432;

const env = config({ path: '.env' });
expand(env);

if (!process.env.DATABASE_URI) {
  console.error('❌ Error: DATABASE_URI is not defined.');
  process.exit(1);
}

const args = ['run', '--rm'];
const uri = parse(process.env.DATABASE_URI);

if (process.stdin.isTTY && process.stdout.isTTY) {
  args.push('-it');
}

args.push('-p', `${uri.port ?? PG_PORT}:${PG_PORT}`);

args.push(
  '-e',
  uri.password
    ? `POSTGRES_PASSWORD=${uri.password}`
    : 'POSTGRES_HOST_AUTH_METHOD=trust',
);

const currentUser = uri.user || userInfo().username;
if (currentUser !== 'postgres') {
  args.push('-e', `POSTGRES_USER=${currentUser}`);
}

args.push('-e', `POSTGRES_DB=${uri.database || 'postgres'}`, 'postgres:17');

const res = spawnSync('docker', args, { stdio: 'inherit', shell: false });
process.exit(res.status ?? 0);
