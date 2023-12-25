import { createCookie } from "@remix-run/node";
import { env } from "~/utils/env.server";

export const userCookie = createCookie("_nouvet_user", {
	httpOnly: true,
	maxAge: 15 * 60,
	secure: true,
});

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
