import { redirect, type LoaderFunctionArgs, json } from "@remix-run/node";
import { returnUrlCookie, userCookie } from "~/auth/cookie.server";
import { useLucia } from "~/auth/lucia.server";

/** Validates user auth. Expected to run before any other loader,
 * to verify the authentication and set caller's ID for other loaders to access.
 *
 * If user is not authenticated and is not already on /login page, redirect them there.
 * If user session is expired, remove old session and redirect them to /login page.
 * If user session is refreshed, update it.
 *
 * Set user params as a cookie for other loaders to access it.
 */
export async function loader({ request }: LoaderFunctionArgs) {
	const { pathname } = new URL(request.url);

	const lucia = useLucia();
	const cookieHeader = request.headers.get("Cookie");
	const sessionId = lucia.readSessionCookie(cookieHeader ?? "");
	if (!sessionId) {
		throw redirect("/app/login", {
			headers: [["Set-Cookie", await returnUrlCookie.serialize(pathname)]],
		});
	}

	const { session, user } = await lucia.validateSession(sessionId);

	if (!session) {
		// sessionId is not valid, reset it
		const blankSessionCookie = lucia.createBlankSessionCookie();
		throw redirect("/app/login", {
			headers: [
				["Set-Cookie", blankSessionCookie.serialize()],
				["Set-Cookie", await returnUrlCookie.serialize(pathname)],
			],
		});
	}

	const headers = new Headers();
	headers.append(
		"Set-Cookie",
		await userCookie.serialize(JSON.stringify(user)),
	);
	// the session has been updated, update the cookie expiration date
	if (session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		headers.append("Set-Cookie", sessionCookie.serialize());
	}
	return json(null, {
		headers,
	});
}
