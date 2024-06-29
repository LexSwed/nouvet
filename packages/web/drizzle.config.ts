import type { Config } from "drizzle-kit";

export default {
	schema: "./src/server/db/schema.ts",
	out: "./.drizzle/migrations",
	dialect: "sqlite",
	dbCredentials: {
		url: String(process.env.DB_CONNECTION),
	},
} satisfies Config;
