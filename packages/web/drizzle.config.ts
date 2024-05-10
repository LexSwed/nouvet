import 'dotenv/config';

import { type Config } from 'drizzle-kit';

export default {
  schema: './src/server/db/schema.ts',
  out: './.drizzle/migrations',
  dialect: 'sqlite',
  // driver: 'better-sqlite',
  dbCredentials: {
    url: String(process.env.DB),
  },
} satisfies Config;
