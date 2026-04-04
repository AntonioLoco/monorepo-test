import type { Kysely } from 'kysely';

import { type User, UserSchema } from '@anabolix/types';

import type { DB } from '../db.types';

const createUser = async (
  db: Kysely<DB>,
  user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
) => {
  const validatedUser = UserSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  }).safeParse(user);
  if (!validatedUser.success) {
    throw validatedUser.error;
  }

  return db
    .insertInto('users')
    .values({
      ...validatedUser.data,
      activityEndDelivery: 'both',
      activityExpirationDelivery: 'both',
      activityStartDelivery: 'both',
      nominationEndDelivery: 'both',
      nominationExpirationDelivery: 'both',
      nominationStartDelivery: 'both',
      securityEndDelivery: 'both',
      securityExpirationDelivery: 'both',
      securityStartDelivery: 'both',
      trainingEndDelivery: 'both',
      trainingExpirationDelivery: 'both',
      trainingStartDelivery: 'both',
    })
    .returning('id')
    .executeTakeFirstOrThrow();
};

export { createUser };
