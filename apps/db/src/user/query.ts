import type { Kysely } from 'kysely';

import type { DB } from '../db.types';

const getUserById = async (db: Kysely<DB>, id: number) => {
  return db
    .selectFrom('users')
    .where('id', '=', id)
    .select([
      'id',
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'createdAt',
      'updatedAt',
    ])
    .executeTakeFirst();
};

const getUsers = async (db: Kysely<DB>) => {
  return db
    .selectFrom('users')
    .select([
      'id',
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'createdAt',
      'updatedAt',
    ])
    .execute();
};

export { getUserById, getUsers };
