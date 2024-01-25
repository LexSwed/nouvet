import Database from 'better-sqlite3';
import {
  drizzle,
  type BetterSQLite3Database,
} from 'drizzle-orm/better-sqlite3';

import { env } from '~/server/env';

const sqlite = new Database(env.DB);
let _db: BetterSQLite3Database | null = null;

export const useDb = () => {
  'use server';

  if (!_db) {
    _db = drizzle(sqlite, { logger: env.DEV });
  }

  return _db;
};
