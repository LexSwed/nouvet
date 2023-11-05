import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import {
	sqliteTable,
	text,
	integer,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const countries = sqliteTable(
	"countries",
	{
		id: integer("id").primaryKey(),
		name: text("name"),
	},
	(countries) => ({
		nameIdx: uniqueIndex("nameIdx").on(countries.name),
	}),
);

export const cities = sqliteTable("cities", {
	id: integer("id").primaryKey(),
	name: text("name"),
	countryId: integer("country_id").references(() => countries.id),
});

export const users = sqliteTable("users", {
	id: integer("id").primaryKey(),
	fullName: text("full_name"),
	phone: text("phone"),
});

const sqlite = new Database("./db/sqlite.db");

export const db = drizzle(sqlite);
