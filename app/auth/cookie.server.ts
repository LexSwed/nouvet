import { createCookie, redirect } from "@remix-run/node";
import { env } from "~/utils/env.server";
import {
	object,
	string,
	picklist,
	type Output,
	parse,
	safeParse,
} from "valibot";
import { acceptedLocales } from "~/i18n/shared";
import type { DatabaseUserProfile } from "~/db/schema";

export const returnUrlCookie = createCookie("_nouvet_return_url_cookie", {
	httpOnly: true,
	maxAge: 15 * 60,
	secure: true,
});

export const facebookAuthCookie = createCookie("oauth_state", {
	httpOnly: true,
	secure: env.PROD,
	maxAge: 60 * 10, // 10 minutes
	path: "/",
});

/**
 * For Server usage only to access current request user.
 * It is expected that auth middleware will throw redirect if the session is expired.
 * After session is updated, this cookie will be renewed as well.
 * TODO: Is there's a chance for race condition when route loader shows the data before auth middleware?
 */
const userCookie = createCookie("_nouvet_user", {
	httpOnly: true,
	maxAge: 30 * 24 * 60 * 60, // 30 days
	secure: true,
});

const userCookieSchema = object({
	id: string("User ID cannot be empty"),
	locale: picklist<
		DatabaseUserProfile["locale"],
		Array<DatabaseUserProfile["locale"]>
	>(acceptedLocales),
	// timeZone: date(),
	measurementSystem: picklist<
		DatabaseUserProfile["measurementSystem"],
		Array<DatabaseUserProfile["measurementSystem"]>
	>(["imperial", "metrical"]),
});

type RequestUser = Output<typeof userCookieSchema>;

/**
 * Returns user preferences from the cookie.
 * @throws {ValiError} if the cookie is not set, expired, or unsupported values are stored.
 */
export async function getRequestUser(request: Request): Promise<RequestUser> {
	const cookieString =
		(await userCookie.parse(request.headers.get("Cookie"))) ?? "";
	return parse(userCookieSchema, cookieString);
}

/**
 * Returns user preferences from the cookie.
 * If incorrect values are stored, user is not authed, or the cookie is expired - includes an error.
 */
export async function getSafeRequestUser(request: Request) {
	const cookieString =
		(await userCookie.parse(request.headers.get("Cookie"))) ?? "";
	return safeParse(userCookieSchema, cookieString);
}

/**
 * Serializes user to a cookie for 180 days if all the values are correct.
 * @throws {ValiError} if locale or measurements system is not supported.
 */
export async function serializeUserCookie(user: RequestUser) {
	const parsed = parse(userCookieSchema, user);
	return userCookie.serialize(parsed);
}
