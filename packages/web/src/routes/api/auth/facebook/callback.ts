import type { PageEvent } from "@solidjs/start/server";
import { OAuth2RequestError } from "arctic";
import { object, parse, string } from "valibot";
import { deleteCookie, getCookie, sendRedirect } from "vinxi/http";

import { createUserSession } from "~/server/auth/user-session";
import { RETURN_URL_COOKIE } from "~/server/const";
import { getUserByAuthProviderId } from "~/server/db/queries/getUserByAuthProviderId";
import { userCreate } from "~/server/db/queries/userCreate";
import { getLocale } from "~/server/i18n/locale";

import { getFacebookOAuthStateCookie, useFacebookAuth } from "./_shared";

export const GET = async (event: PageEvent) => {
	const { request } = event;
	const stateCookie = getFacebookOAuthStateCookie();
	const facebookAuth = useFacebookAuth();

	const url = new URL(request.url);
	const state = url.searchParams.get("state");
	const code = url.searchParams.get("code");

	// verify state
	if (!state || !stateCookie || !code || stateCookie !== state) {
		console.error("Facebook auth callback is called without state");
		return sendRedirect("/app/login", 422);
	}

	try {
		const tokens = await facebookAuth.validateAuthorizationCode(code);
		const facebookUser = await fetchFacebookUser(tokens.accessToken);

		const existingUser = await getUserByAuthProviderId("facebook", facebookUser.id);
		let returnUrl = getCookie(RETURN_URL_COOKIE);

		if (returnUrl) {
			deleteCookie(RETURN_URL_COOKIE);
		}

		switch (returnUrl) {
			case "/":
			case "/app/login":
			case "/app/logout":
				returnUrl = "/app";
				break;
		}

		if (existingUser) {
			await createUserSession(event.nativeEvent, {
				userId: existingUser.id,
				locale: existingUser.locale ?? "en-GB",
				measurementSystem: existingUser.measurementSystem ?? "metrical",
			});

			return sendRedirect(returnUrl || "/app");
		}
		const locale = await getLocale();

		const measurementSystem =
			locale.region && ["US", "LR", "MM"].includes(locale.region) ? "imperial" : "metrical";

		const user = await userCreate({
			provider: "facebook",
			accountProviderId: facebookUser.id,
			name: facebookUser.name,
			locale: locale.language,
			measurementSystem: measurementSystem,
		});

		await createUserSession(event.nativeEvent, {
			userId: user.id,
			locale: locale.language,
			measurementSystem,
		});

		return sendRedirect(returnUrl || "/app");
	} catch (error) {
		console.log(error);
		if (error instanceof OAuth2RequestError) {
			// bad verification code, invalid credentials, etc
			return new Response(null, {
				status: 400,
			});
		}
		return new Response(null, {
			status: 500,
		});
	}
};

const facebookUserSchema = object({
	id: string(),
	name: string(),
});
async function fetchFacebookUser(accessToken: string) {
	const url = new URL("https://graph.facebook.com/me");
	url.searchParams.set("access_token", accessToken);
	url.searchParams.set("fields", ["id", "name", "picture", "email"].join(","));
	const response = await fetch(url);

	if (response.ok) {
		const user = (await response.json()) as unknown;
		return parse(facebookUserSchema, user);
	}
	throw new Error(`Couldn't get Facebook user from Facebook API`);
}
