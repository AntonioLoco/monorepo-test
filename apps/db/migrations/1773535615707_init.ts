import { sql, type Kysely } from 'kysely';

import type { DB } from '../src';

const PERMISSION_SUB_CATEGORY = ['read', 'create', 'update', 'delete'];

const PERMISSION_CATEGORY = [
  'users',
  'expirations',
  'dashboard',
  'courses',
  'tasks',
  'reports',
  'collaborators',
  'settings',
];

const PERMISSIONS: {
  key: string;
  global?: boolean;
  parent_permission_key?: string;
  order?: number;
}[] = [{ key: 'super', global: true }];
for (const key of PERMISSION_CATEGORY) {
  PERMISSIONS.push({ key, parent_permission_key: 'super' });
  PERMISSION_SUB_CATEGORY.forEach((subKey, index) => {
    PERMISSIONS.push({
      key: `${key}.${subKey}`,
      parent_permission_key: key,
      order: Number(index + 1),
    });
  });
}

// oxlint-disable-next-line typescript/no-explicit-any
export const up = async (db: Kysely<any>): Promise<void> => {
  await sql`CREATE EXTENSION IF NOT EXISTS "citext";`.execute(db);
  await sql`CREATE EXTENSION IF NOT EXISTS "unaccent";`.execute(db);

  await sql`
    CREATE FUNCTION public.f_unaccent(text) RETURNS text IMMUTABLE
    AS $$
    BEGIN
      RETURN public.unaccent($1);
    END;
    $$ LANGUAGE plpgsql;`.execute(db);

  await db.schema
    .createType('notification_delivery')
    .asEnum(['none', 'inapp', 'email', 'both'])
    .execute();

  await db.schema
    .createTable('users')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('first_name', 'text', (col) => col.notNull())
    .addColumn('last_name', 'text', (col) => col.notNull())
    .addColumn('nickname', sql`citext`, (col) => col.notNull())
    .addColumn('email', sql`citext`, (col) => col.notNull())
    .addColumn('phone_number', 'text')
    .addColumn('password', 'text', (col) => col.notNull())
    .addColumn(
      'security_expiration_delivery',
      sql`notification_delivery`,
      (col) => col.notNull(),
    )
    .addColumn('security_start_delivery', sql`notification_delivery`, (col) =>
      col.notNull(),
    )
    .addColumn('security_end_delivery', sql`notification_delivery`, (col) =>
      col.notNull(),
    )
    .addColumn(
      'training_expiration_delivery',
      sql`notification_delivery`,
      (col) => col.notNull(),
    )
    .addColumn('training_start_delivery', sql`notification_delivery`, (col) =>
      col.notNull(),
    )
    .addColumn('training_end_delivery', sql`notification_delivery`, (col) =>
      col.notNull(),
    )
    .addColumn(
      'nomination_expiration_delivery',
      sql`notification_delivery`,
      (col) => col.notNull(),
    )
    .addColumn('nomination_start_delivery', sql`notification_delivery`, (col) =>
      col.notNull(),
    )
    .addColumn('nomination_end_delivery', sql`notification_delivery`, (col) =>
      col.notNull(),
    )
    .addColumn(
      'activity_expiration_delivery',
      sql`notification_delivery`,
      (col) => col.notNull(),
    )
    .addColumn('activity_start_delivery', sql`notification_delivery`, (col) =>
      col.notNull(),
    )
    .addColumn('activity_end_delivery', sql`notification_delivery`, (col) =>
      col.notNull(),
    )
    .addColumn('deleted_at', 'timestamptz')
    .addColumn('updated_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createIndex('users_nickname_uniq_idx')
    .on('users')
    .column('nickname')
    .unique()
    .where(sql`deleted_at`, 'is', null)
    .execute();

  await db.schema
    .createIndex('users_email_uniq_idx')
    .on('users')
    .column('email')
    .unique()
    .where(sql`deleted_at`, 'is', null)
    .execute();

  await db.schema
    .createTable('refresh_tokens')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('expires_at', 'timestamptz', (col) => col.notNull())
    .addColumn('user_id', 'integer', (col) => col.notNull())
    .addForeignKeyConstraint(
      'refresh_tokens_user_id_fkey',
      ['user_id'],
      'users',
      ['id'],
    )
    .execute();

  await db.schema
    .createTable('permissions')
    .addColumn('key', 'text', (col) => col.primaryKey())
    .addColumn('parent_permission_key', 'text', (col) =>
      col.references('permissions.key').onDelete('cascade'),
    )
    .addColumn('global', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('order', 'integer', (col) => col.notNull().defaultTo(0))
    .execute();

  await db.schema
    .createTable('users_permissions')
    .addColumn('user_id', 'integer', (col) =>
      col.references('users.id').onDelete('cascade'),
    )
    .addColumn('permission_key', 'varchar', (col) =>
      col.references('permissions.key').onDelete('cascade'),
    )
    .addPrimaryKeyConstraint('users_permissions_pkey', [
      'user_id',
      'permission_key',
    ])
    .execute();

  await db.schema
    .createTable('roles')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull())
    .addColumn('description', 'text', (col) => col.notNull())
    .addColumn('deleted_at', 'timestamptz')
    .addUniqueConstraint('roles_unique', ['slug', 'deleted_at'], (col) =>
      col.nullsNotDistinct(),
    )
    .execute();

  await db.schema
    .createTable('roles_permissions')
    .addColumn('role_id', 'integer', (col) =>
      col.references('roles.id').onDelete('cascade'),
    )
    .addColumn('permission_key', 'varchar', (col) =>
      col.references('permissions.key').onDelete('cascade'),
    )
    .addPrimaryKeyConstraint('roles_permissions_pkey', [
      'role_id',
      'permission_key',
    ])
    .execute();

  await db.schema
    .createTable('users_roles')
    .addColumn('role_id', 'integer', (col) =>
      col.references('roles.id').onDelete('cascade'),
    )
    .addColumn('user_id', 'integer', (col) =>
      col.references('users.id').onDelete('cascade'),
    )
    .addPrimaryKeyConstraint('user_role_pkey', ['role_id', 'user_id'])
    .execute();

  await db.schema
    .createTable('settings')
    .addColumn('key', 'text', (col) => col.notNull())
    .addColumn('value', 'text', (col) => col.notNull())
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addPrimaryKeyConstraint('settings_pkey', ['key'])
    .execute();

  await db.schema.createTable('task-kind').execute();

  await db.schema
    .createTable('sites')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', sql`citext`, (col) => col.notNull())
    .addColumn('deleted_at', 'timestamptz')
    .execute();

  await db.schema
    .createIndex('sites_name_uniq_idx')
    .on('sites')
    .column('name')
    .unique()
    .execute();

  await db.schema
    .createTable('skills')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', sql`citext`, (col) => col.notNull())
    .addColumn('deleted_at', 'timestamptz')
    .execute();

  await db.schema
    .createIndex('skills_name_uniq_idx')
    .on('skills')
    .column('name')
    .unique()
    .execute();

  // DML

  await db.insertInto('permissions').values(PERMISSIONS).execute();

  const { id: adminRoleId } = await db
    .insertInto('roles')
    .values({ slug: 'admin', description: 'Admin' })
    .returning('id')
    .executeTakeFirstOrThrow();

  await db
    .insertInto('roles_permissions')
    .values(
      PERMISSION_CATEGORY.map(
        (key) =>
          ({
            role_id: adminRoleId,
            permission_key: key,
          }) as const,
      ),
    )
    .execute();
};

export const down = async (db: Kysely<DB>): Promise<void> => {
  await db.schema.dropTable('skills').ifExists().execute();
  await db.schema.dropTable('sites').ifExists().execute();
  await db.schema.dropTable('task-kind').ifExists().execute();
  await db.schema.dropTable('settings').ifExists().execute();
  await db.schema.dropTable('users_roles').ifExists().execute();
  await db.schema.dropTable('roles_permissions').ifExists().execute();
  await db.schema.dropTable('roles').ifExists().execute();
  await db.schema.dropTable('users_permissions').ifExists().execute();
  await db.schema.dropTable('permissions').ifExists().execute();
  await db.schema.dropTable('refresh_tokens').ifExists().execute();
  await db.schema.dropTable('users').ifExists().execute();
  await db.schema.dropType('notification_delivery').ifExists().execute();
};
