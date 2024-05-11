import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

export const familyTable = sqliteTable(
  'family',
  {
    id: integer('id').notNull().primaryKey({ autoIncrement: true }),
    name: text('name', { length: 100 }),
    ownerId: integer('owner_id')
      .notNull()
      .references(() => userTable.id),
    createdAt: utcDatetime('created_at'),
  },
  (table) => {
    return {
      ownerIdx: index('owner_idx').on(table.ownerId),
    };
  },
);

/**
 * Temporary invitations to a family. Only the creator of the family can send the invites.
 * Hence, a family might not be created yet when the invite is sent – it's created when invited user joins the family
 */
export const familyInviteTable = sqliteTable(
  'family_invite',
  {
    /**
     * Invitation code
     */
    inviteCode: text('invite_code', { length: 20 }).notNull().primaryKey(),
    /**
     * User who created the invite.
     * TODO: enforce connection with family to make sure only owners can create invites.
     */
    inviterId: integer('inviter_id')
      .notNull()
      .references(() => userTable.id),
    /**
     * UNIX timestamp in **seconds**.
     */
    expiresAt: integer('expires_at').notNull(),
    /**
     * QR Code hash. Since QR codes allow to join the family directly, users with just
     * invite code could avoid approval by hitting a different endpoint with the
     * invitation code they get from the link. By hashing the QR code, having invitation code itself
     * won't allow to bypass the approval process.
     */
    invitationHash: text('invitation_hash', { length: 64 }).notNull(),
  },
  (table) => ({
    hashIdx: index('hash_idx').on(table.invitationHash),
  }),
);
export type DatabaseFamily = typeof familyTable.$inferSelect;

export const familyUserTable = sqliteTable(
  'family_user',
  {
    familyId: integer('family_id')
      .notNull()
      .references(() => familyTable.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    joinedAt: utcDatetime('joined_at'),
  },
  (table) => {
    return {
      pk: primaryKey({
        // user id comes first as it's the most common way of requesting the family
        columns: [table.userId, table.familyId],
      }),
    };
  },
);

export const familyWaitListTable = sqliteTable(
  'family_wait_list',
  {
    familyId: integer('family_id')
      .notNull()
      .references(() => familyTable.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    joinedAt: utcDatetime('joined_at'),
  },
  (table) => {
    return {
      pk: primaryKey({
        // user id comes first as it's the most common way of requesting the family
        columns: [table.userId, table.familyId],
      }),
    };
  },
);

export const petTable = sqliteTable('pet', {
  id: integer('id').notNull().primaryKey({ autoIncrement: true }),
  /** Pets have an official owner that has access to all the data. Other people have access to pets only through families. */
  ownerId: integer('owner_id')
    .notNull()
    // TODO: add constraint for Max amount of pets, when the constraints are available
    .references(() => userTable.id),
  /** Name of a pet */
  name: text('name', { length: 200 }).notNull(),
  gender: text('gender', { mode: 'text', enum: ['male', 'female'] as const }),
  type: text('animal_type', {
    mode: 'text',
    enum: ['dog', 'cat', 'bird', 'rabbit', 'rodent', 'horse'] as const,
  }).notNull(),
  breed: text('breed_name', { length: 200 }),
  color: text('color'),
  /** Supports partial ISO, e.g. YYYY-MM */
  dateOfBirth: dateTime('date_of_birth'),
  /** Weight in user's measurement system */
  weight: integer('weight', { mode: 'number' }),
  /** A signed URL to animal picture */
  pictureUrl: text('picture_url', { length: 120 }),
  identityNumber: text('identity_number', { length: 120 }),
  createdAt: utcDatetime('created_at'),
});
export type DatabasePet = typeof petTable.$inferSelect;

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
 */
export const userTable = sqliteTable('user', {
  id: integer('id').notNull().primaryKey({ autoIncrement: true }),
  /** User's name, set by auth provider, or updated manually afterwards. */
  name: text('name', { length: 200 }),
  /** User's picture, only for personalization purposes. */
  avatarUrl: text('avatar_url', { length: 200 }),
  /** Full ISO code, language and region. Inferred from browser on creation, can be changed later. */
  locale: text('locale').notNull(),
  /** Used for weights formatting, etc. Stored separately in case user wants to change it. */
  measurementSystem: text('measurement_system', {
    mode: 'text',
    enum: ['imperial', 'metrical'] as const,
  }).notNull(),
  /**
   * UTC with appended Z for Date constructor.
   */
  createdAt: utcDatetime('created_at'),
});

/**
 * Maps different OAuth accounts to the same user.
 */
export const authAccount = sqliteTable(
  'oauth_account',
  {
    provider: text('provider_id', { enum: ['facebook'] }).notNull(),
    userId: integer('user_id')
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
  userId: integer('user_id')
    .notNull()
    .references(() => userTable.id),
  /**
   * unix seconds
   */
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
    // TODO: extract into own const?
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
  creatorId: integer('creator_id').references(() => userTable.id),
  // TODO: events can be referenced to each other? Many to Many? Or more linear?
  /** Inner structure is typed in code, based on the EventType.
   */
  dataJson: text('data_json', { mode: 'json' }),
  /**
   * TODO: Don't want to update whole JSON when attaching new files, maybe separate field is better? */
  // attachments: []
  /**
   * UTC with appended Z for Date constructor.
   * TODO: This field is used for sorting, any chance for speed up? */
  date: dateTime('date'),

  updatedAt: utcDatetime('date'),
});

/**
 * These are recurring events, an automatic Todo list for the owners.
 * Can include going for a walk, giving a pill, or having check-ups.
 * Reminders can create events.
 */
export const remindersTable = sqliteTable('reminder', {
  id: integer('id').notNull().primaryKey({ autoIncrement: true }),
  creatorId: integer('creator_id')
    .notNull()
    .references(() => userTable.id),
  petId: integer('pet_id')
    .notNull()
    .references(() => petTable.id),
  /**
   * UTC with appended Z for Date constructor.
   */
  createdAt: utcDatetime('created_at'),
});

/**
 * ISO 8601 date string stored in UTC with appended Z for Date constructor.
 * Maybe appending 'Z' is bad for non-JS runtimes who could work with this DB dates, but that's not a concern right now.
 */
function utcDatetime(columnName: Parameters<typeof text>[0]) {
  return dateTime(columnName)
    .notNull()
    .default(sql`(concat(datetime('now', 'utc'), 'Z'))`);
}

function dateTime(columnName: Parameters<typeof text>[0]) {
  return text(columnName, { mode: 'text', length: 50 });
}
