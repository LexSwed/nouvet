import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { Lucia } from 'lucia';

import { useDb } from '../db';
import { sessionTable, userTable } from '../db/schema';
import { env } from '../env';

export const useLucia = () => {
  const db = useDb();
  const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);

  const lucia = new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        sameSite: env.PROD ? 'lax' : undefined,
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
