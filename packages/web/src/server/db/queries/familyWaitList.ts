"use server";

import { and, eq } from "drizzle-orm";

import { useDb } from "~/server/db";
import {
	type UserID,
	familyTable,
	familyUserTable,
	familyWaitListTable,
	userTable,
} from "~/server/db/schema";

export async function familyWaitList(userId: UserID) {
	const db = useDb();

	const family = db
		.select({ familyId: familyUserTable.familyId })
		.from(familyUserTable)
		.where(and(eq(familyUserTable.userId, userId), eq(familyTable.ownerId, userId)))
		.innerJoin(familyTable, eq(familyTable.id, familyUserTable.familyId));

	const users = await db
		.select({
			id: userTable.id,
			name: userTable.name,
			avatarUrl: userTable.avatarUrl,
			joinedAt: familyWaitListTable.joinedAt,
		})
		.from(familyWaitListTable)
		.where(eq(familyWaitListTable.familyId, family))
		.innerJoin(userTable, eq(familyWaitListTable.userId, userTable.id))
		.orderBy(familyWaitListTable.joinedAt)
		.all();

	return users;
}
