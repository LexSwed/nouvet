import * as v from "valibot";
import { sendRedirect, updateSession, useSession } from "vinxi/server";

import { SESSION_COOKIE } from "~/server/const";
import type { DatabaseUser } from "~/server/db/schema";
import { env } from "~/server/env";
import type { acceptedLocaleLanguageTag } from "~/server/i18n/shared";
import type { UserID } from "~/server/types";
import { createSession, invalidateSession, validateSessionToken } from "./session";

/**
 * Creates new auth session and stores it in cookie with other user basic user info.
 * @throws {v.ValiError} if user info provided is not correct.
 * @throws {Error} if auth/database issues.
 */
export async function createUserSession({
	userId,
	locale,
	timeZoneId,
	measurementSystem,
}: {
	userId: UserSession["userId"];
	timeZoneId: UserSession["timeZoneId"];
	locale: UserSession["locale"];
	measurementSystem: UserSession["measurementSystem"];
}) {
	const authSession = await createSession(userId);

	await updateRequestUser(
		{
			userId,
			locale,
			timeZoneId,
			measurementSystem,
			sessionId: authSession.id,
		},
		authSession,
	);
}

/**
 * Validates current auth session.
 * @throws {Error} if auth/database issues.
 */
export async function validateAuthSession(): Promise<DatabaseUser | null> {
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
	const userSession = await unsafe_useUserSession();
	if (!("sessionId" in userSession.data)) {
		// Cleanup just in case
		await deleteUserSession();
		return null;
	}

	const { session, user } = await validateSessionToken(
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

	await updateRequestUser({ ...userSession.data, sessionId: session.id }, session);

	return user;
}
/**
 * Logs user out, invalidating DB session and all associated cookies.
 */
export async function deleteUserSession() {
	const session = await unsafe_useUserSession();
	if ("sessionId" in session.data) {
		await invalidateSession(session.data.sessionId);
	}
	await session.clear();
}
export interface UserSession extends v.InferOutput<typeof userCookieSchema> {
	userId: UserID;
}

/**
 * DO NOT USE OR YOU WILL BE FIRED.
 * Should only be used when the cookie is expected to possibly be not available.
 */
export async function unsafe_useUserSession() {
	// biome-ignore lint/complexity/noBannedTypes: It works great here, forcing property check first on session.data
	const session = await useSession<UserSession | {}>({
		name: SESSION_COOKIE,
		password: env.SESSION_SECRET,
	});
	return session;
}

export async function useUserSession() {
	const session = await unsafe_useUserSession();
	if (!("userId" in session.data)) {
		await deleteUserSession();
		throw sendRedirect("/app/login");
	}
	return { ...session, data: session.data };
}

const userCookieSchema = v.object({
	userId: v.pipe(v.string(), v.trim(), v.nonEmpty()),
	sessionId: v.string(),
	locale: v.pipe(
		v.string(),
		v.transform((v) => v as (typeof acceptedLocaleLanguageTag)[number]),
	),
	timeZoneId: v.pipe(
		v.string(),
		v.trim(),
		v.nonEmpty(),
		v.picklist(Intl.supportedValuesOf("timeZone")),
	),
	measurementSystem: v.picklist(["imperial", "metrical"] as const satisfies Array<
		DatabaseUser["measurementSystem"]
	>),
});

/**
 * Sets current user to the cookies.
 * @throws {v.ValiError} when provided user data is invalid.
 */
async function updateRequestUser(user: UserSession, authSession: { expiresAt: Date }) {
	await updateSession(
		{
			name: SESSION_COOKIE,
			password: env.SESSION_SECRET,
			cookie: {
				// keep enabled in DEV for --host debugging on real device
				secure: env.PROD,
				expires: authSession.expiresAt,
				httpOnly: true,
				sameSite: "lax" as const,
				path: "/",
			},
		},
		v.parse(userCookieSchema, user),
	);
}
