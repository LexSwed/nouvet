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
  /** Pets have an official owner that has access to all the data. */
  ownerId: text('owner_id')
    .notNull()
    .references(() => userTable.id),
  /** Name of a pet */
  name: text('name', { length: 200 })
    .notNull()
    .$default(() => ''),
  /** TODO: find a scientific name for it. */
  sex: text('sex', { length: 50 }),
  breedId: integer('breed_id')
    .notNull()
    .references(() => breedTable.id),
  hairColor: text('color'),
  /** Supports partial ISO, e.g. YYYY-MM */
  dateOfBirth: utcDatetime('date_of_birth', false),
});
export type DatabasePet = typeof petTable.$inferSelect;

export const breedTable = sqliteTable('breed', {
  id: integer('id').notNull().primaryKey({ autoIncrement: true }),
  /** Should be inferrable from the source. 'dog' | 'cat' | 'nutria' | 'etc'.
   *  TODO: Can be enumed? */
  animalType: text('animal_type').notNull(),
  /** Has to include "Other" for people who don't know the breed */
  name: text('name').notNull().unique(),
  // photoUrl: string;
});

export const userTable = sqliteTable('user', {
  /** TODO: why this ID has to be text? */
  id: text('id').notNull().primaryKey(),
  familyId: integer('family_id').references(() => familyTable.id),
  createdAt: utcDatetime('created_at'),
});

// export const mediaTable = sqliteTable('user-media', {
//   id: integer('id').notNull().primaryKey({ autoIncrement: true }),
//   sourceUrl: text('source_url').notNull(),
//   uploaderId: text('uploader_id')
//     .notNull()
//     .references(() => userTable.id, { onDelete: 'cascade' }),
//   uploadDate: utcDatetime('created_at'),
// });

/**
 * User profile details and preferences.
 * TODO: Maybe should be stored in cookies?
 * Locale should be accessed on each request, to get translations, not updated often (on login or change of preferences).
 * This cookie can be part of the `User` on `events.local`, to convert all data into correct format.
 */
export const userProfileTable = sqliteTable('user_profile', {
  userId: text('user_id')
    .notNull()
    .primaryKey()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  /** User's name, set by auth provider, or updated manually afterwards. */
  name: text('name', { length: 200 }),
  /** User's picture, only for personalization purposes. */
  avatarUrl: text('avatar_url', { length: 200 }),
  /** Full ISO code, language and region. Inferred from browser on creation, can be changed later. */
  locale: text('locale').notNull(),
  /** 'imperical' or 'metrical'. Used for times, events
   * TODO: can be enum? */
  measurementsSystem: text('measurements_system').notNull(),
});

/**
 * Maps different OAuth accounts to the same user.
 */
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

/**
 * Stores all user sessions to verify validity of requests.
 */
export const sessionTable = sqliteTable('user_session', {
  /** User can have multiple sessions across devices */
  id: text('id').notNull().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id),
  expiresAt: integer('expires_at').notNull(),
});

/**
 * These are calendar events. They can be attached to the request for doctor’s visit.
 */
export const eventsTable = sqliteTable('event', {
  id: integer('id').notNull().primaryKey({ autoIncrement: true }),
  /** Type of the event selected by the client.
   * TODO: create index for faster look-ups
   */
  type: text('type', {
    mode: 'text',
    // TODO: extract into const? Own
    enum: [
      'weight-in',
      'new-pill',
      'observation',
      'food-change',
      'doctor-visit',
    ],
  }).notNull(),
  /** Should default to event type default name.
   * Stored separately for quick access without loading all the details from the `data` JSON field; */
  name: text('name').notNull(),
  petId: integer('pet_id').references(() => petTable.id),
  creatorId: text('creator_id').references(() => userTable.id),
  // TODO: events can be referenced to each other? Many to Many? Or more linear?
  /** Inner structure is typed in code, based on the EventType.
   */
  dataJson: text('data_json', { mode: 'json' }),
  /**
   * TODO: Don't want to update whole JSON when attaching new files, maybe separate field is better? */
  // attachments: []
  /** User provided date of the event.
   * TODO: This field is used for sorting, any chance for speed up? */
  date: utcDatetime('date', false),

  updatedAt: utcDatetime('date'),
});

/**
 * These are recurring events, an automatic Todo list for the owners.
 * Can include going for a walk, giving a pill, or having check-ups.
 * Reminders can create events.
 */
export const remindersTable = sqliteTable('reminder', {
  id: integer('id').notNull().primaryKey({ autoIncrement: true }),
  creatorId: text('creator_id')
    .notNull()
    .references(() => userTable.id),
  petId: integer('pet_id')
    .notNull()
    .references(() => petTable.id),
});

/** ISO 8601 date string stored in UTC */
function utcDatetime(
  columnName: Parameters<typeof text>[0],
  autogenerated: boolean = true,
) {
  const column = text(columnName, { mode: 'text', length: 27 });
  if (autogenerated) {
    return column.default(sql`(datetime('now'))`);
  }
  return column;
}
