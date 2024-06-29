import "dotenv/config";

import { resolve } from "node:path";
import { faker } from "@faker-js/faker";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "../src/server/db/schema";

const sqlite = new Database(process.env.DB_CONNECTION!);
const db = drizzle(sqlite, { schema, logger: true });

async function seed() {
	const users = Array.from({ length: 5 }).map((_, i) => ({
		id: `${i}`,
		name: faker.person.fullName(),
		measurementSystem: faker.helpers.arrayElement(["imperial", "metrical"]) as
			| "imperial"
			| "metrical",
		locale: "en-GB" as const,
	}));
	await db.insert(schema.userTable).values(users);
}

const seedFile = process.argv
	.slice(2)
	.find((arg) => arg.startsWith("--seed-file"))
	?.split("=")
	.at(1);

if (seedFile) {
	try {
		const file = await import(resolve(seedFile));
		file.seed(db);
	} catch (error) {
		console.error(error);
	}
} else {
	seed();
}
