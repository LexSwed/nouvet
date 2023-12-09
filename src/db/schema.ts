import { createId } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const familyTable = sqliteTable('family', {
  id: integer('id').notNull().primaryKey({ autoIncrement: true }),
  name: text('name', { length: 100 }).default(''),
});

export const userTable = sqliteTable('user', {
  id: text('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  facebookId: text('facebook_id').notNull().unique(),
  familyId: integer('family_id').references(() => familyTable.id),
  name: text('name', { length: 200 }),
  /** ISO 8601 date string */
  createdAt: text('created_at', { mode: 'text', length: 27 }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export type DatabaseUser = typeof userTable.$inferSelect;

export const sessionTable = sqliteTable('user_session', {
  id: text('id').notNull().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id),
  expiresAt: integer('expires_at').notNull(),
});
