import { drizzle } from "drizzle-orm/better-sqlite3";
import { sqliteTable, text, blob } from "drizzle-orm/sqlite-core";
import { sqlite } from "./db.server.ts";

export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	// other user attributes
});

export const session = sqliteTable("user_session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	activeExpires: blob("active_expires", {
		mode: "bigint",
	}).notNull(),
	idleExpires: blob("idle_expires", {
		mode: "bigint",
	}).notNull(),
});

export const key = sqliteTable("user_key", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	hashedPassword: text("hashed_password"),
});

export const initDb = () => drizzle(sqlite);
