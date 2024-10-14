"use server";

import { eq, or, sql } from "drizzle-orm";

import { useDb } from "~/server/db";
import { familyTable, familyUserTable, familyWaitListTable, userTable } from "~/server/db/schema";
import type { UserID } from "~/server/types";

export async function userProfile(userId: UserID) {
	const db = useDb();
	const userProfile = await db
		.select({
			id: userTable.id,
			name: userTable.name,
			avatarUrl: userTable.avatarUrl,
			measurementSystem: userTable.measurementSystem,
			locale: userTable.locale,
			timeZoneId: userTable.timeZoneId,
		})
		.from(userTable)
		.where(eq(userTable.id, userId))
		.get();

	if (!userProfile) throw new Error(`User ${userId} not found`);

	return userProfile;
}

export async function userFamily(userId: UserID) {
	const db = useDb();

	const userFamily = await db
		.select({
			id: userTable.id,
			name: userTable.name,
			avatarUrl: userTable.avatarUrl,
			family: {
				id: familyTable.id,
				name: familyTable.name,
				role: sql<
					"owner" | "member" | "waiting"
				>`(iif(${familyTable.ownerId} == ${userId}, 'owner', iif(${familyWaitListTable.userId} == ${userId}, 'waiting', 'member')))`,
			},
		})
		.from(userTable)
		.where(eq(userTable.id, userId))
		.leftJoin(familyUserTable, eq(familyUserTable.userId, userId))
		.leftJoin(familyWaitListTable, eq(familyWaitListTable.userId, userId))
		.leftJoin(
			familyTable,
			or(
				eq(familyTable.id, familyUserTable.familyId),
				eq(familyTable.id, familyWaitListTable.familyId),
			),
		)
		.get();

	if (!userFamily) return null;

	return userFamily;
}
