import { betterSqlite3 } from "@lucia-auth/adapter-sqlite";
import { lucia } from "lucia";
import { web } from "lucia/middleware";
import { env } from "~/utils/env.server.ts";
import { sqlite } from "../../db/db.server.ts";
import { facebook } from "@lucia-auth/oauth/providers";

export const auth = lucia({
	env: env.PROD ? "PROD" : "DEV",
	adapter: betterSqlite3(sqlite, {
		user: "user",
		key: "user_key",
		session: "user_session",
	}),
	middleware: web(),
	sessionCookie: {
		expires: false,
	},
	getUserAttributes: (data) => {
		return {
			facebookName: data.username,
		};
	},
});

export const facebookAuth = facebook(auth, {
	clientId: env.FACEBOOK_APP_ID,
	clientSecret: env.FACEBOOK_APP_SECRET,
	redirectUri: "/family/auth",
});

export type Auth = typeof auth;
