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
		expiresAt: expiresAt(),
	};
	await useDb().insert(sessionTable).values(session);

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

	if (isExpired(session)) {
		await invalidateSession(session.id);
		return { session: null, user: null };
	}
	if (shouldRefresh(session)) {
		session.expiresAt = expiresAt();
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

	await db.delete(sessionTable).where(eq(sessionTable.id, sessionId)).run();
}

export type SessionValidationResult =
	| { session: DatabaseSession; user: DatabaseUser }
	| { session: null; user: null };

function encodeToken(token: string) {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

function expiresAt() {
	return new Date(Date.now() + Temporal.Duration.from({ days: 30 }).total("milliseconds"));
}

function shouldRefresh(session: DatabaseSession) {
	return (
		Date.now() >=
		session.expiresAt.getTime() - Temporal.Duration.from({ days: 14 }).total("milliseconds")
	);
}

function isExpired(session: DatabaseSession) {
	return Date.now() >= session.expiresAt.getTime();
}
