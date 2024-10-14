import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/server/db/schema.ts",
	out: "./.drizzle/migrations",
	dialect: "sqlite",
	dbCredentials: {
		url: String(process.env.DB_CONNECTION),
	},
	breakpoints: true,
	verbose: true,
	strict: true,
});
