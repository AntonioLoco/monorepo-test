import type { Kysely } from 'kysely';

import { type User, UserSchema } from '@anabolix/types';

import type { DB } from '../db.types';

const createUser = async (db: Kysely<DB>, user: Omit<User, 'id'>) => {
  const validatedUser = UserSchema.omit({ id: true }).safeParse(user);
  if (!validatedUser.success) {
    console.log('validatedUser.error', validatedUser.error);
    throw validatedUser.error;
  }
  console.log('createUser', validatedUser);

  return true;
};

export { createUser };
