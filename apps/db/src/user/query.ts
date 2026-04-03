import type { Kysely } from 'kysely';

import type { DB } from '../db.types';

const getUserById = async (db: Kysely<DB>, id: number) => {
  return db
    .selectFrom('users')
    .where('id', '=', id)
    .select([
      'id',
      'first_name',
      'last_name',
      'email',
      'phone_number',
      'created_at',
      'updated_at',
    ])
    .executeTakeFirst();
};

const getUsers = async (db: Kysely<DB>) => {
  return db
    .selectFrom('users')
    .select([
      'id',
      'first_name',
      'last_name',
      'email',
      'phone_number',
      'created_at',
      'updated_at',
    ])
    .execute();
};

export { getUserById, getUsers };
