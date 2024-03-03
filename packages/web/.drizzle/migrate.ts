import 'dotenv/config';

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import * as schema from '../src/server/db/schema';

const sqlite = new Database(process.env.DB!);
const db = drizzle(sqlite, { schema, logger: true });

// This will run migrations on the database, skipping the ones already applied
await migrate(db, { migrationsFolder: '.drizzle/migrations' });
