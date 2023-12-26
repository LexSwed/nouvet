import { type User, verifyRequestOrigin } from 'lucia';
import { getRequestEvent, type RequestEvent } from 'solid-js/web';
import { object, picklist, string, type Output, parse } from 'valibot';
import {
  deleteCookie,
  sendRedirect,
  setCookie,
  useSession,
} from 'vinxi/server';
import { env } from '../env';
import type { DatabaseUserProfile } from '../db/schema';
import { useLucia } from './lucia';

/**
 * Creates new auth session.
 * @throws {ValiError} if user info provided is not correct.
 * @throws {Error} if auth/database issues.
 */
export async function createUserSession(user: UserSession) {
  const event = getRequestEvent();
  const lucia = useLucia();
  const authSession = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(authSession.id);

  setCookie(
    event!,
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  await setRequestUser(event!, user);
}

/**
 * Validates current auth session.
 * @throws {Error} if auth/database issues.
 */
export async function validateAuthSession(
  event: RequestEvent,
): Promise<User | null> {
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
    // Cleanup just in case
    await deleteRequestUser(event);
    return null;
  }

  const { session, user } = await lucia.validateSession(sessionId);

  if (!session) {
    // sessionId is not valid, reset it
    const sessionCookie = lucia.createBlankSessionCookie();
    deleteCookie(event, sessionCookie.name);
    // Cleanup just in case
    await deleteRequestUser(event);
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

/**
 * Logs user out, invalidating DB session and all associated cookies.
 */
export async function deleteUserSession() {
  const event = getRequestEvent();
  const lucia = useLucia();

  const cookieHeader = event!.request.headers.get('Cookie');
  const sessionId = lucia.readSessionCookie(cookieHeader ?? '');
  if (sessionId) {
    await lucia.invalidateSession(sessionId);
  }
  await deleteRequestUser(event!);
}

const userCookieSchema = object({
  id: string(),
  locale: string('locale cannot be empty'),
  // timeZone: date(),
  measurementSystem: picklist(['imperial', 'metrical'] as const satisfies Array<
    DatabaseUserProfile['measurementSystem']
  >),
});

export type UserSession = Output<typeof userCookieSchema>;

/**
 * User session is stored separately from the auth session.
 * TODO: The only reason auth session is separated from the user session is Lucia's adapter that doesn't
 * do joins. While user session is created, updated, and removed with auth session, to keep them in sync,
 * it's suboptimal. See if it's possible to override only a specific query on Lucia Adapter to produce
 * a different query with `join` and save it alongside user ID on the auth session cookie.
 */
function useUserSession(event: RequestEvent) {
  return useSession<UserSession>(event, {
    name: '_nouvet_user',
    password: env.SESSION_SECRET,
  });
}

/**
 * Returns current user from request cookies.
 * @throws {ValiError} - when the cookie is missing, expired, or stores invalid data.
 */
export async function getRequestUser(
  event: RequestEvent,
): Promise<UserSession> {
  try {
    const session = await useUserSession(event);
    return parse(userCookieSchema, session.data);
  } catch (error) {
    throw sendRedirect(getRequestEvent()!, '/app/login');
  }
}

/**
 * Sets current user to the cookies.
 * @throws {ValiError} when provided user data is invalid.
 */
export async function setRequestUser(event: RequestEvent, user: UserSession) {
  const session = await useUserSession(event);
  await session.update(parse(userCookieSchema, user));
}

/**
 * Removes user session cookie.
 */
export async function deleteRequestUser(event: RequestEvent) {
  const session = await useUserSession(event);
  await session.clear();
}
