import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import { env } from '../env';

export const useDb = () => {
  const sqlite = new Database(env.DB);
  return drizzle(sqlite, { logger: env.DEV });
};
