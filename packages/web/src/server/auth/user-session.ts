import { type User } from 'lucia';
import * as v from 'valibot';
import {
  sendRedirect,
  updateSession,
  useSession,
  type CookieSerializeOptions,
  type HTTPEvent,
} from 'vinxi/server';

import { useLucia } from '~/server/auth/lucia';
import { SESSION_COOKIE } from '~/server/const';
import type { DatabaseUser } from '~/server/db/schema';

import { env } from '../env';

/**
 * Creates new auth session and stores it in cookie with other user basic user info.
 * @throws {v.ValiError} if user info provided is not correct.
 * @throws {Error} if auth/database issues.
 */
export async function createUserSession(
  event: HTTPEvent,
  {
    userId,
    locale,
    measurementSystem,
  }: {
    userId: UserSession['userId'];
    locale: UserSession['locale'];
    measurementSystem: UserSession['measurementSystem'];
  },
) {
  const lucia = useLucia();
  const authSession = await lucia.createSession(userId, {});

  await updateRequestUser(
    event,
    {
      userId,
      locale,
      measurementSystem,
      sessionId: authSession.id,
    },
    {
      // keep enabled in DEV for --host debugging on real device
      secure: env.PROD,
      expires: authSession.expiresAt,
    },
  );
}

/**
 * Validates current auth session.
 * @throws {Error} if auth/database issues.
 */
export async function validateAuthSession(
  event: HTTPEvent,
): Promise<User | null> {
  // TODO: validate request origin, disabled while
  // https://github.com/nksaraf/vinxi/issues/304
  // if (env.PROD) {
  //   const originHeader = event.headers.get('Origin');
  //   const hostHeader = event.headers.get('Host');
  //   if (
  //     !originHeader ||
  //     !hostHeader ||
  //     !verifyRequestOrigin(originHeader, [hostHeader])
  //   ) {
  //     throw new Error('Request Origin is not matching');
  //   }
  // }
  const lucia = useLucia();
  const userSession = await tryUseUserSession();
  if (!userSession.id) {
    // Cleanup just in case
    await deleteUserSession();
    return null;
  }

  const { session, user } = await lucia.validateSession(
    /**
     * NB: userSession.id is a unique identifier assigned to a user when visiting the website,
     * even before authentication. data.sessionId refers to the actual auth session ID stored in the database.
     */
    userSession.data.sessionId,
  );

  if (!session) {
    // Cleanup just in case
    await deleteUserSession();
    return null;
  }

  // the session has been updated, update the cookie expiration date
  if (session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);
    updateRequestUser(
      event,
      { ...userSession.data, sessionId: session.id },
      sessionCookie.attributes,
    );
  }

  return user;
}

/**
 * Logs user out, invalidating DB session and all associated cookies.
 */
export async function deleteUserSession() {
  const session = await tryUseUserSession();
  if (session.data.sessionId) {
    await useLucia().invalidateSession(session.data.sessionId);
  }
  await session.clear();
}
export type UserSession = v.InferOutput<typeof userCookieSchema>;

/**
 * DO NOT USE OR YOU WILL BE FIRED.
 * Should only be used when cookie is expected to possibly not be available (f.e. yet).
 */
export async function tryUseUserSession() {
  const session = await useSession<UserSession>({
    name: SESSION_COOKIE,
    password: env.SESSION_SECRET,
  });
  return session;
}

export async function useUserSession() {
  const session = await tryUseUserSession();
  if (!session.data.userId) {
    await deleteUserSession();
    throw sendRedirect('/app/login');
  }
  return session;
}

const userCookieSchema = v.object({
  userId: v.pipe(v.string(), v.trim(), v.nonEmpty()),
  sessionId: v.string(),
  locale: v.string(),
  // timeZone: date(),
  measurementSystem: v.picklist([
    'imperial',
    'metrical',
  ] as const satisfies Array<DatabaseUser['measurementSystem']>),
});

/**
 * Sets current user to the cookies.
 * @throws {v.ValiError} when provided user data is invalid.
 */
async function updateRequestUser(
  event: HTTPEvent,
  user: UserSession,
  config?: CookieSerializeOptions,
) {
  await updateSession(
    event,
    {
      name: SESSION_COOKIE,
      password: env.SESSION_SECRET,
      cookie: config,
    },
    v.parse(userCookieSchema, user),
  );
}
