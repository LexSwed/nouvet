import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { eq } from "drizzle-orm";
import { Temporal } from "temporal-polyfill";
import type { DatabaseSession, UserID } from "~/server/types";
import { useDb } from "../db";
import { type DatabaseUser, sessionTable, userTable } from "../db/schema";

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export async function createSession(userId: UserID) {
	const sessionId = encodeToken(generateSessionToken());
	const session = {
		id: sessionId,
		userId,
		expiresAt: new Date(SESSION.expiresAt()),
	};
	await useDb()
		.insert(sessionTable)
		.values({ ...session, expiresAt: session.expiresAt });

	return session;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeToken(token);
	const db = useDb();
	const result = await db
		.select({ user: userTable, session: sessionTable })
		.from(sessionTable)
		.innerJoin(userTable, eq(sessionTable.userId, userTable.id))
		.where(eq(sessionTable.id, sessionId))
		.get();
	if (!result) {
		return { session: null, user: null };
	}
	const { user, session } = result;

	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
		return { session: null, user: null };
	}
	if (Date.now() >= session.expiresAt.getTime() - SESSION.refreshAt()) {
		session.expiresAt = new Date(SESSION.expiresAt());
		await db
			.update(sessionTable)
			.set({
				expiresAt: session.expiresAt,
			})
			.where(eq(sessionTable.id, session.id));
	}
	return { session, user };
}

export async function invalidateSession(sessionId: string) {
	const db = useDb();

	await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export type SessionValidationResult =
	| { session: DatabaseSession; user: DatabaseUser }
	| { session: null; user: null };

function encodeToken(token: string) {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

const SESSION = {
	expiresAt() {
		return Date.now() + Temporal.Duration.from({ days: 30 }).total("milliseconds");
	},
	refreshAt() {
		return Date.now() + Temporal.Duration.from({ days: 10 }).total("milliseconds");
	},
};
