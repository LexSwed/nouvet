import { createId } from '@paralleldrive/cuid2';
import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';

export const familyTable = sqliteTable('family', {
  id: integer('id').notNull().primaryKey({ autoIncrement: true }),
  name: text('name', { length: 100 }),
});

export const userTable = sqliteTable(
  'user',
  {
    id: text('id')
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    facebookId: text('facebook_id').notNull(),
  },
  (t) => ({
    id_facebookId: unique('id_facebookId').on(t.id, t.facebookId),
  }),
);

export const profileInfo = sqliteTable('profile_info', {
  id: integer('id').notNull().primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => userTable.id, {
    onDelete: 'cascade',
  }),
  name: text('name', { length: 200 }),
});

export const sessionTable = sqliteTable('user_session', {
  id: text('id').notNull().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id),
  expiresAt: integer('expires_at').notNull(),
});
