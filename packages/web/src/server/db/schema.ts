import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { customAlphabet } from "nanoid";

export const familyTable = sqliteTable(
	"family",
	{
		id: primaryId("id", "f"),
		name: text("name", { length: 100 }),
		ownerId: text("owner_id")
			.notNull()
			.references(() => userTable.id),
		createdAt: utcDateTime("created_at"),
	},
	(table) => ({
		ownerIdx: index("owner_idx").on(table.ownerId),
	}),
);

/**
 * Temporary invitations to a family. Only the creator of the family can send the invites.
 * Hence, a family might not be created yet when the invite is sent – it's created when invited user joins the family
 */
export const familyInviteTable = sqliteTable(
	"family_invite",
	{
		/**
		 * Invitation code
		 */
		inviteCode: text("invite_code", { length: 20 }).notNull().primaryKey(),
		/**
		 * User who created the invite.
		 * TODO: enforce connection with family to make sure only owners can create invites.
		 */
		inviterId: text("inviter_id")
			.notNull()
			.references(() => userTable.id),
		/**
		 * UNIX timestamp in **seconds**.
		 */
		expiresAt: integer("expires_at").notNull(),
		/**
		 * QR Code hash. Since QR codes allow to join the family directly, users with just
		 * invite code could avoid approval by hitting a different endpoint with the
		 * invitation code they get from the link. By hashing the QR code, having invitation code itself
		 * won't allow to bypass the approval process.
		 */
		invitationHash: text("invitation_hash", { length: 64 }).notNull(),
	},
	(table) => ({
		hashIdx: index("hash_idx").on(table.invitationHash),
	}),
);
export type DatabaseFamily = typeof familyTable.$inferSelect;

export const familyUserTable = sqliteTable(
	"family_user",
	{
		familyId: text("family_id")
			.notNull()
			.references(() => familyTable.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" }),
		/** Zoned date time ISO */
		joinedAt: utcDateTime("joined_at"),
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
	"family_wait_list",
	{
		familyId: text("family_id")
			.notNull()
			.references(() => familyTable.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => userTable.id, { onDelete: "cascade" }),
		/** Zoned date time ISO */
		joinedAt: utcDateTime("joined_at"),
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

export const petTable = sqliteTable("pet", {
	id: primaryId("id", "p"),
	/** Pets have an official owner that has access to all the data. Other people have access to pets only through families. */
	ownerId: text("owner_id")
		.notNull()
		// TODO: add constraint for Max amount of pets, when the constraints are available
		.references(() => userTable.id),
	/** Name of a pet */
	name: text("name", { length: 200 }).notNull(),
	gender: text("gender", { mode: "text", enum: ["male", "female"] as const }),
	species: text("species", {
		mode: "text",
		enum: ["dog", "cat", "bird", "rabbit", "rodent", "horse"] as const,
	}).notNull(),
	breed: text("breed_name", { length: 200 }),
	color: text("color"),
	/** ISO 8601 string yyyy-MM-dd */
	dateOfBirth: dateTime("date_of_birth"),
	/** Weight in metrical system of measurement */
	weight: integer("weight", { mode: "number" }),
	/** Height in metrical system of measurement */
	height: integer("height", { mode: "number" }),
	/** A signed URL to animal picture */
	pictureUrl: text("picture_url", { length: 120 }),
	/** TODO: how this can be used now, without connections to doctors? */
	identityCode: text("identity_code", { length: 120 }),
	createdAt: utcDateTime("created_at"),
	updatedAt: utcDateTime("updated_at", { autoUpdate: true }),
});
export type DatabasePet = typeof petTable.$inferSelect;

// export const mediaTable = sqliteTable('user-media', {
//   id: integer('id').notNull().primaryKey({ autoIncrement: true }),
//   sourceUrl: text('source_url').notNull(),
//   uploaderId: text('uploader_id')
//     .notNull()
//     .references(() => userTable.id, { onDelete: 'cascade' }),
//   uploadDate: utcDateTime('created_at'),
// });

/**
 * User profile details and preferences.
 */
export const userTable = sqliteTable("user", {
	id: primaryId("id", "u"),
	/** User's name, set by auth provider, or updated manually afterwards. */
	name: text("name", { length: 200 }),
	/** User's picture, only for personalization purposes. */
	avatarUrl: text("avatar_url", { length: 200 }),
	/** Full ISO code, language and region. Inferred from browser on creation, can be changed later. */
	locale: text("locale", { length: 10 }).notNull(),
	timeZoneId: text("time_zone_id", { length: 100 }).notNull(),
	/** Used for weights formatting, etc. Stored separately in case user wants to change it. */
	measurementSystem: text("measurement_system", {
		mode: "text",
		enum: ["imperial", "metrical"] as const,
	}).notNull(),
	createdAt: utcDateTime("created_at"),
});
export type DatabaseUser = typeof userTable.$inferSelect;
export type UserID = DatabaseUser["id"];
export type PetID = DatabasePet["id"];

/**
 * Maps different OAuth accounts to the same user.
 */
export const authAccount = sqliteTable(
	"oauth_account",
	{
		provider: text("provider_id", { enum: ["facebook"] }).notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => userTable.id),
		/** ID of the user on the auth provider side */
		providerUserId: text("provider_user_id").notNull(),
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.provider, table.providerUserId] }),
		};
	},
);
export type SupportedAuthProvider = (typeof authAccount.$inferInsert)["provider"];

/**
 * Stores all user sessions to verify validity of requests.
 */
export const sessionTable = sqliteTable("user_session", {
	/** User can have multiple sessions across devices */
	id: text("id").notNull().unique().primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id),
	/**
	 * unix seconds
	 */
	expiresAt: integer("expires_at").notNull(),
});

export const activitiesTable = sqliteTable("activity", {
	id: primaryId("id", "ac"),
	petId: text("pet_id").references(() => petTable.id),
	creatorId: text("creator_id").references(() => userTable.id),
	/** Type of the event selected by the client.
	 * TODO: create index for faster look-ups
	 */
	type: text("type", {
		mode: "text",
		enum: ["observation", "prescription", "vaccination", "appointment"] as const,
	}).notNull(),
	note: text("note", { length: 1000 }),
	// attachments: [],
	/*	TODO: This field is used for sorting, any chance for speed up? */
	date: zonedDateTimeISO("activity_date"),
});

export type ActivityType = (typeof activitiesTable.$inferInsert)["type"];

export const vaccinationsTable = sqliteTable("vaccination", {
	id: primaryId("id", "vc"),
	activityId: text("activity_id").references(() => activitiesTable.id, { onDelete: "cascade" }),
	name: text("vaccine_name", { length: 200 }).notNull(),
	administeredDate: dateTime("administered_date").notNull(),
	nextDueDate: dateTime("next_due_date"),
	batchNumber: text("batch_number", { length: 50 }),
});

export const activityRelationships = sqliteTable(
	"activity_relationships",
	{
		parentActivityId: text("parent_activity_id").references(() => activitiesTable.id, {
			onDelete: "cascade",
		}),
		childActivityId: text("child_activity_id").references(() => activitiesTable.id, {
			onDelete: "cascade",
		}),
	},
	(table) => {
		return {
			pk: primaryKey({
				columns: [table.parentActivityId, table.childActivityId],
			}),
		};
	},
);

/**
 * Stores date in a ZonedDateTimeISO format.
 * If you need ZonedDateTime, it should be sent from the client.
 * @example '2024-03-07T03:24:30.000003500+05:30[Asia/Kolkata]'
 * @link https://tc39.es/proposal-temporal/docs/zoneddatetime.html
 */
function zonedDateTimeISO(columnName: Parameters<typeof text>[0]) {
	return dateTime(columnName).notNull();
}

/**
 * ISO-8601 date time string stored in UTC.
 */
function utcDateTime(columnName: Parameters<typeof text>[0], { autoUpdate = false } = {}) {
	const utcNow = sql<string>`(strftime('%FT%TZ', datetime('now')))`;
	const column = dateTime(columnName)
		.notNull()
		// see https://www.sqlite.org/lang_datefunc.html
		// TODO: verify why datetime('now', 'utc') applies timezone twice. Drizzle bug? sqlite driver?
		.default(utcNow);
	if (autoUpdate) {
		column.$onUpdate(() => utcNow);
	}
	return column;
}

function dateTime(columnName: Parameters<typeof text>[0]) {
	return text(columnName, { mode: "text", length: 100 });
}

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 12);
function primaryId(columnName: Parameters<typeof text>[0], prefix?: string) {
	return text(columnName)
		.notNull()
		.primaryKey()
		.unique()
		.$default(() => (prefix ? `${prefix}_${nanoid()}` : nanoid()));
}
