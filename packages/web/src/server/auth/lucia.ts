import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia, TimeSpan } from "lucia";

import { useDb } from "~/server/db";
import { sessionTable, userTable } from "~/server/db/schema";
import { env } from "~/server/env";
import type { UserID } from "~/server/types";

export const useLucia = () => {
	const db = useDb();
	const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);
	const lucia = new Lucia(adapter, {
		sessionExpiresIn: new TimeSpan(30, "d"),
		sessionCookie: {
			attributes: {
				secure: env.PROD,
			},
		},
	});

	return lucia;
};

declare module "lucia" {
	interface Register {
		Lucia: ReturnType<typeof useLucia>;
		UserId: UserID;
	}
	interface DatabaseUserAttributes {}
	interface DatabaseSessionAttributes {}
}
