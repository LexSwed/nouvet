import { isServer } from "solid-js/web";
import { boolean, object, parse, picklist, string } from "valibot";

if (!isServer) throw Error("This module cannot be imported from client module");

const schema = object({
	// Vite defaults
	BASE_URL: string(),
	MODE: picklist(["production", "development"]),
	DEV: boolean(),
	PROD: boolean(),
	SSR: boolean(),
	// Facebook App
	FACEBOOK_APP_ID: string(),
	FACEBOOK_APP_SECRET: string(),
	// Session encryption secret
	SESSION_SECRET: string(),
	// Invites encryption secret
	INVITES_SECRET: string(),
	// DB connection string
	DB: string(),
});

export const env = parse(schema, {
	...import.meta.env,
	PROD: import.meta.env.VITE_ACCEPTANCE_TESTING ? false : import.meta.env.PROD,
	SESSION_SECRET: process.env.SESSION_SECRET,
	INVITES_SECRET: process.env.INVITES_SECRET,
	FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
	FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
	DB: process.env.DB_CONNECTION,
});
