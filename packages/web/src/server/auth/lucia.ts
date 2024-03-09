import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { Lucia } from 'lucia';

import { useDb } from '~/server/db';
import { sessionTable, userTable } from '~/server/db/schema';
import { env } from '~/server/env';

export const useLucia = () => {
  const db = useDb();
  const adapter = new DrizzleSQLiteAdapter(
    db,
    // @ts-expect-error requires lucia adapter types update
    sessionTable,
    userTable,
  );

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
    UserId: number;
  }
  interface DatabaseUserAttributes {}
  interface DatabaseSessionAttributes {}
}
