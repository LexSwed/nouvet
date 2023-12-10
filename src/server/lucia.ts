import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { type FetchEvent } from '@solidjs/start/server/types';
import { Facebook } from 'arctic';
import { Lucia, type User } from 'lucia';
import { verifyRequestOrigin } from 'oslo/request';
import { setCookie } from 'vinxi/server';

import { useDb } from './db';
import { sessionTable, userTable } from './db/schema';
import { env } from '~/server/env';

export const useLucia = () => {
  const db = useDb();
  const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);

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

export async function validateUser(event: FetchEvent): Promise<User | null> {
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
    return null;
  }

  const { session, user } = await lucia.validateSession(sessionId);

  if (!session) {
    // sessionId is not valid, reset it
    const sessionCookie = lucia.createBlankSessionCookie();
    setCookie(
      event,
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    return null;
  }

  // the session has been updated, update the cookie expiration date
  if (session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);
    setCookie(
      event,
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  }

  return user;
}
