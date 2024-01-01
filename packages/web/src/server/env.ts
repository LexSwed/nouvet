import {
  parse,
  boolean,
  picklist,
  string,
  object,
  ValiError,
  type Output,
} from 'valibot';

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
  SESSION_SECRET: string(),
});

('use server');
export let env: Output<typeof schema>;

try {
  env = parse(schema, {
    ...import.meta.env,
    SESSION_SECRET: process.env.SESSION_SECRET,
    FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
    DB: process.env.DB,
  });
} catch (error) {
  if (error instanceof ValiError) {
    console.error(error.cause, error.issues);
  }
}
