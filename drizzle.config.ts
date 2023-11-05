import { type Config } from "drizzle-kit";

export default {
	out: "./db/.drizzle",
	schema: "./db/schema.ts",
	driver: "better-sqlite",
	dbCredentials: {
		url: "./db/sqlite.db",
	},
} satisfies Config;
