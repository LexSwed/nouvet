import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useFacebookAuth, useLucia } from "~/auth/lucia.server";
import { getUserByAuthProviderId } from "~/db/queries/getUserByAuthProviderId";
import {
	facebookAuthCookie,
	returnUrlCookie,
	serializeUserCookie,
} from "~/auth/cookie.server";
import { object, parse, string } from "valibot";
import { getI18n } from "react-i18next";
import { createUser } from "~/db/queries/createUser";
import { OAuth2RequestError } from "arctic";

export async function loader({ request }: LoaderFunctionArgs) {
	const cookieString = request.headers.get("Cookie");
	const stateCookie = await facebookAuthCookie.parse(cookieString);
	const facebookAuth = useFacebookAuth(request);

	const url = new URL(request.url);
	const state = url.searchParams.get("state");
	const code = url.searchParams.get("code");

	// verify state
	if (!state || !stateCookie || !code || stateCookie !== state) {
		console.error("Facebook auth callback is called without state");
		throw new Response(null, {
			status: 400,
		});
	}

	try {
		const tokens = await facebookAuth.validateAuthorizationCode(code);
		const facebookUser = await fetchFacebookUser(tokens.accessToken);
		const lucia = useLucia();

		const existingUser = await getUserByAuthProviderId(
			"facebook",
			facebookUser.id,
		);
		const headers = new Headers();

		let returnUrl = await returnUrlCookie.parse(cookieString);

		if (returnUrl) {
			returnUrl = returnUrl === "/app/login" ? null : returnUrl;
			headers.append(
				"Set-Cookie",
				await returnUrlCookie.serialize("", { maxAge: 0 }),
			);
		}

		if (existingUser) {
			const session = await lucia.createSession(existingUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			headers.append(
				"Set-Cookie",
				await serializeUserCookie({
					id: existingUser.id,
					locale: existingUser.locale!,
					measurementSystem: existingUser.measurementSystem!,
				}),
			);
			headers.append("Set-Cookie", sessionCookie.serialize());

			throw redirect(returnUrl || "/app", { headers });
		}

		/** New User */
		const localeString = getI18n().language || "en-GB";
		const locale = new Intl.Locale(localeString);

		const measurementSystem =
			locale.region && ["US", "LR", "MM"].includes(locale.region)
				? "imperial"
				: "metrical";

		const user = await createUser({
			provider: "facebook",
			accountProviderId: facebookUser.id,
			name: facebookUser.name,
			locale: locale.baseName,
			measurementSystem: measurementSystem,
		});

		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		headers.append(
			"Set-Cookie",
			await serializeUserCookie({
				...user,
				locale: locale.baseName,
				measurementSystem,
			}),
		);
		headers.append("Set-Cookie", sessionCookie.serialize());

		throw redirect(returnUrl || "/app", { headers });
	} catch (error) {
		if (error instanceof OAuth2RequestError) {
			console.error(error);
			// bad verification code, invalid credentials, etc
			throw new Response(null, {
				status: 400,
			});
		}
		throw error;
	}
}

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
