import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { type Kysely } from 'kysely';

import type { DB } from '../src';

const cleanName = (s: string) =>
  s
    .normalize('NFD')
    .toLowerCase()
    .replaceAll(/[^a-z0-9\\._@$!%&*+/^~|-]+/gm, '');

const createNickname = (firstName: string, lastName: string): string =>
  `${cleanName(firstName)}.${cleanName(lastName)}`;

const createIdentity = (first_name: string, last_name: string) => ({
  first_name,
  last_name,
  nickname: createNickname(first_name, last_name),
});

const DEFAULT_NOTIFICATION_SETTINGS = {
  security_expiration_delivery: 'both',
  security_start_delivery: 'both',
  security_end_delivery: 'both',
  training_expiration_delivery: 'both',
  training_start_delivery: 'both',
  training_end_delivery: 'both',
  nomination_expiration_delivery: 'both',
  nomination_start_delivery: 'both',
  nomination_end_delivery: 'both',
  activity_expiration_delivery: 'both',
  activity_start_delivery: 'both',
  activity_end_delivery: 'both',
} as const;

const mockedUsers = (hashedPassword: string) =>
  faker.helpers.multiple(
    () =>
      ({
        ...createIdentity(faker.person.firstName(), faker.person.lastName()),
        email: faker.internet.email(),
        phone_number: faker.phone.number(),
        created_at: new Date(),
        updated_at: new Date(),
        ...DEFAULT_NOTIFICATION_SETTINGS,
        password: hashedPassword,
      }) as const,
    { count: 250 },
  );

export const seed = async (db: Kysely<DB>): Promise<void> => {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('12345', salt);
  const insertUserQuery = db.insertInto('users').returning('id');
  const superUser = await insertUserQuery
    .values({
      ...createIdentity('Supér', 'TecnoNews'),
      email: 'super@vertex.local',
      phone_number: '999',
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
      ...DEFAULT_NOTIFICATION_SETTINGS,
    })
    .executeTakeFirst();

  await db
    .insertInto('users_permissions')
    .values({
      user_id: superUser!.id,
      permission_key: 'super',
    })
    .execute();

  const otherUsers = await insertUserQuery
    .values([
      {
        ...createIdentity('Valerio', 'Maggi'),
        email: 'valerio.maggi@vertex.local',
        phone_number: '3331234567',
        password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
        ...DEFAULT_NOTIFICATION_SETTINGS,
      },
      ...mockedUsers(hashedPassword),
    ])
    .execute()
    .then((users) => users.map((user) => user.id));

  for (const userId of otherUsers) {
    await db
      .insertInto('users_permissions')
      .values([
        {
          user_id: userId,
          permission_key: 'users.read',
        },
        {
          user_id: userId,
          permission_key: 'users.update',
        },
        {
          user_id: userId,
          permission_key: 'users.create',
        },
        {
          user_id: userId,
          permission_key: 'users.delete',
        },
        {
          user_id: userId,
          permission_key: 'dashboard.read',
        },
      ])
      .execute();
  }
};
