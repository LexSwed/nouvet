import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { Lucia, TimeSpan } from 'lucia';

import { useDb } from '../db';
import { sessionTable, userTable } from '../db/schema';
import { env } from '~/server/env';

export const useLucia = () => {
  const db = useDb();
  const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);

  const lucia = new Lucia(adapter, {
    sessionExpiresIn: new TimeSpan(1, 'm'),
    sessionCookie: {
      name: '_nouvet_auth_session',
      attributes: {
        secure: env.PROD,
      },
    },
  });

  return lucia;
};

declare module 'lucia' {
  interface Register {
    Lucia: ReturnType<typeof useLucia>;
  }
  interface DatabaseUserAttributes {}
  interface DatabaseSessionAttributes {}
}
