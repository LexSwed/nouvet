'use server';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { Facebook } from 'arctic';
import { Lucia } from 'lucia';
import { env } from './env';
import { useDb } from '~/db/db';
import { sessionTable, userTable } from '~/db/schema';

export const useLucia = () => {
  const db = useDb();
  const adapter = new DrizzleSQLiteAdapter(
    db,
    sessionTable,
    // @ts-expect-error autogenerating IDs instead of using Lucia's createId
    userTable,
  );

  const lucia = new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: env.PROD,
      },
    },
    getUserAttributes: (attributes) => {
      console.log('===attributes===', attributes);
      return {
        facebookId: attributes.facebook_id,
      };
    },
  });

  return lucia;
};

export const useFacebookAuth = () => {
  return new Facebook(
    env.FACEBOOK_APP_ID,
    env.FACEBOOK_APP_SECRET,
    'http://localhost:3000/api/auth/facebook/callback',
  );
};

type LuciaInstance = ReturnType<typeof useLucia>;

declare module 'lucia' {
  interface Register {
    Lucia: LuciaInstance;
    DatabaseUserAttributes: {
      facebook_id: string;
    };
  }
}
