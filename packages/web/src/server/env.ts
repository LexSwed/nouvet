import { boolean, object, parse, picklist, string } from 'valibot';

const schema = object({
  // Vite defaults
  BASE_URL: string(),
  MODE: picklist(['production', 'development', 'test']),
  DEV: boolean(),
  PROD: boolean(),
  SSR: boolean(),
  // Facebook App
  FACEBOOK_APP_ID: string(),
  FACEBOOK_APP_SECRET: string(),
  DB: string(),
  // Session encryption secret
  SESSION_SECRET: string(),
});

export const env = parse(schema, {
  ...import.meta.env,
  SESSION_SECRET: process.env.SESSION_SECRET,
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
  DB: process.env.DB,
});
