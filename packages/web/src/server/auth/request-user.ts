"use server";

import { type UserSession, useUserSession } from "./user-session";

/**
 * Returns current user from request cookies.
 * Redirects to /app/login page if user credentials are expired or missing.
 */
export async function getRequestUser(): Promise<UserSession> {
	const session = await useUserSession();
	return session.data;
}
