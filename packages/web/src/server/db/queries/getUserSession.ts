'use server';

import { useUserSession, type UserSession } from '../../auth/user-session';

/**
 * Returns current user from request cookies.
 * Redirects to /app/login page if user credentials are expired or missing.
 */
export async function getRequestUser(): Promise<UserSession> {
  return (await useUserSession()).data;
}
