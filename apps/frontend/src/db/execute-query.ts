import type { DB } from '@anabolix/db';
import type { Kysely } from 'kysely';

import { db } from './kysely';

const executeQuery =
  <A extends unknown[], R>(fn: (db: Kysely<DB>, ...a: A) => R) =>
  (...a: A) =>
    fn(db, ...a);

export default executeQuery;
