import 'dotenv/config';

import { faker } from '@faker-js/faker';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import * as schema from '../src/server/db/schema';

const sqlite = new Database(process.env.DB!);
const db = drizzle(sqlite, { schema, logger: true });

async function seed() {
  const users = Array.from({ length: 5 }).map(() => ({
    name: faker.person.fullName(),
    measurementSystem: faker.helpers.arrayElement(['imperial', 'metrical']) as
      | 'imperial'
      | 'metrical',
    locale: 'en-GB' as const,
  }));
  await db.insert(schema.userTable).values(users);
}

seed();
