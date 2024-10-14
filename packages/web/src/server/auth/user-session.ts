import type { User } from "lucia";
import * as v from "valibot";
import {
	type CookieSerializeOptions,
	type HTTPEvent,
	sendRedirect,
	updateSession,
	useSession,
} from "vinxi/server";

import { useLucia } from "~/server/auth/lucia";
import { SESSION_COOKIE } from "~/server/const";
import type { DatabaseUser } from "~/server/db/schema";
import { env } from "~/server/env";
import type { acceptedLocaleLanguageTag } from "~/server/i18n/shared";
import type { UserID } from "~/server/types";

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
		timeZoneId,
		measurementSystem,
	}: {
		userId: UserSession["userId"];
		timeZoneId: UserSession["timeZoneId"];
		locale: UserSession["locale"];
		measurementSystem: UserSession["measurementSystem"];
	},
) {
	const lucia = useLucia();
	const authSession = await lucia.createSession(userId, {});

	await updateRequestUser(
		event,
		{
			userId,
			locale,
			timeZoneId,
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
export async function validateAuthSession(event: HTTPEvent): Promise<User | null> {
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
	const userSession = await unsafe_useUserSession();
	if (!("sessionId" in userSession.data)) {
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
		await updateRequestUser(
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
	const session = await unsafe_useUserSession();
	if ("sessionId" in session.data) {
		await useLucia().invalidateSession(session.data.sessionId);
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
