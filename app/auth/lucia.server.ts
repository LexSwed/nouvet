import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { Facebook } from "arctic";
import { Lucia, type DatabaseUserAttributes } from "lucia";

import { useDb } from "~/db/db.server";
import { sessionTable, userTable, type DatabaseUser } from "~/db/schema";
import { env } from "~/utils/env.server";

export const useLucia = () => {
	const db = useDb();
	const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);

	const lucia = new Lucia(adapter, {
		sessionCookie: {
			attributes: {
				secure: env.PROD,
			},
		},
		getUserAttributes: (attributes: DatabaseUserAttributes) => ({
			familyId: attributes.familyId,
		}),
	});

	return lucia;
};

declare module "lucia" {
	interface Register {
		Lucia: ReturnType<typeof useLucia>;
	}
	interface DatabaseUserAttributes extends DatabaseUser {}
}

export const useFacebookAuth = (request: Request) => {
	const origin = new URL(request.url).origin;
	return new Facebook(
		env.FACEBOOK_APP_ID,
		env.FACEBOOK_APP_SECRET,
		// TODO:
		`${origin}/api/auth/facebook/callback`,
	);
};
