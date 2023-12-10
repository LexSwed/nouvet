import { sql } from 'drizzle-orm';
import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from 'drizzle-orm/sqlite-core';

export const familyTable = sqliteTable('family', {
  id: integer('id').notNull().primaryKey({ autoIncrement: true }),
  name: text('name', { length: 100 }).notNull().default(''),
  createdAt: utcDatetime('created_at'),
});

export const petTable = sqliteTable('pet', {
  id: integer('id').notNull().primaryKey({ autoIncrement: true }),
  name: text('name', { length: 100 }).notNull(),
  familyId: integer('family_id')
    .notNull()
    .references(() => familyTable.id),
});

export const userTable = sqliteTable('user', {
  id: text('id').notNull().primaryKey(),
  familyId: integer('family_id')
    .notNull()
    .references(() => familyTable.id),
  createdAt: utcDatetime('created_at'),
});

export const userProfileTable = sqliteTable('user_profile', {
  userId: text('user_id')
    .notNull()
    .primaryKey()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  name: text('name', { length: 200 }),
});

export const authAccount = sqliteTable(
  'oauth_account',
  {
    provider: text('provider_id', { enum: ['facebook'] }).notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => userTable.id),
    /** ID of the user on the auth provider side */
    providerUserId: text('provider_user_id').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.provider, table.providerUserId] }),
    };
  },
);
export type SupportedAuthProvider =
  (typeof authAccount.$inferInsert)['provider'];

export type DatabaseUser = typeof userTable.$inferSelect;

export const sessionTable = sqliteTable('user_session', {
  id: text('id').notNull().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id),
  expiresAt: integer('expires_at').notNull(),
});

/** ISO 8601 date string stored in UTC */
function utcDatetime(columnName: Parameters<typeof text>[0]) {
  return text(columnName, { mode: 'text', length: 27 }).default(
    sql`(datetime('now'))`,
  );
}
