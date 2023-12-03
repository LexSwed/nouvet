'use server';
import { parse, boolean, picklist, string, object } from 'valibot';

export const schema = object({
  // Vite defaults
  BASE_URL: string(),
  MODE: picklist(['production', 'development', 'test']),
  DEV: boolean(),
  PROD: boolean(),
  SSR: boolean(),
  // Facebook App
  FACEBOOK_APP_ID: string(),
  FACEBOOK_APP_SECRET: string(),
});

export const env = parse(schema, import.meta.env);
