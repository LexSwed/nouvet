import "dotenv/config";

import { type Config } from "drizzle-kit";

export default {
	schema: "./app/db/schema.ts",
	out: "./app/db/drizzle/migrations",
	driver: "better-sqlite",
	dbCredentials: {
		url: String(process.env.DB),
	},
} satisfies Config;
