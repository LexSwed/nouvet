import { auth, facebookAuth } from "~/auth/lucia.server.ts";
import { serializeCookie } from "lucia/utils";
import type { LoaderFunctionArgs } from "@remix-run/node";

const handler = async (ctx: LoaderFunctionArgs) => {
	if (ctx.request.method !== "GET") return new Response(null, { status: 405 });

	console.log(ctx.params);
	const {} = ctx.params;
	const [url, state] = await facebookAuth.getAuthorizationUrl();
	const stateCookie = serializeCookie("facebook_oauth_state", state, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		path: "/",
		maxAge: 60 * 60,
	});
	return new Response(null, {
		status: 302,
		headers: new Headers({
			"Set-Cookie": stateCookie,
			"Location": url.toString(),
		}),
	});
};

export default handler;
