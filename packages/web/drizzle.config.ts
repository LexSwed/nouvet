import 'dotenv/config';

import { type Config } from 'drizzle-kit';

export default {
  schema: './src/server/db/schema.ts',
  out: './.drizzle/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: String(process.env.DB),
  },
} satisfies Config;
