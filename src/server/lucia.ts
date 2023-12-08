import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { type FetchEvent } from '@solidjs/start/server/types';
import { Facebook } from 'arctic';
import { Lucia } from 'lucia';
import { verifyRequestOrigin } from 'oslo/request';

import { useDb } from '~/db/db';
import { sessionTable, userTable } from '~/db/schema';
import { env } from '~/server/env';

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
  });

  return lucia;
};
type LuciaInstance = ReturnType<typeof useLucia>;

declare module 'lucia' {
  interface Register {
    Lucia: LuciaInstance;
  }
}

export const useFacebookAuth = () => {
  return new Facebook(
    env.FACEBOOK_APP_ID,
    env.FACEBOOK_APP_SECRET,
    'http://localhost:3000/api/auth/facebook/callback',
  );
};

export async function validate(event: FetchEvent): Promise<boolean> {
  if (env.PROD) {
    const originHeader = event.request.headers.get('Origin');
    const hostHeader = event.request.headers.get('Host');
    if (
      !originHeader ||
      !hostHeader ||
      !verifyRequestOrigin(originHeader, [hostHeader])
    ) {
      throw new Error('Request Origin is not matching');
    }
  }
  const lucia = useLucia();
  const cookieHeader = event.request.headers.get('Cookie');
  const sessionId = lucia.readSessionCookie(cookieHeader ?? '');
  if (!sessionId) {
    return false;
  }

  const { session, user } = await lucia.validateSession(sessionId);
  console.log(session, user);
  if (!session || !session.fresh) {
    // sessionId is not valid, reset it
    const sessionCookie = lucia.createBlankSessionCookie();
    event.appendResponseHeader('Set-Cookie', sessionCookie.serialize());
    return false;
  }

  return true;
}
