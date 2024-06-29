"use server";

import { and, eq } from "drizzle-orm";

import { type UserID, familyTable, familyWaitListTable } from "~/server/db/schema";
import { NotAllowedToPerformFamilyAction } from "~/server/errors";

import { useDb } from "..";

export async function familyRemoveFromWaitList(params: {
	familyOwnerId: UserID;
	waitListMemberId: UserID;
}) {
	const db = useDb();

	const family = await db
		.select({ familyId: familyTable.id })
		.from(familyTable)
		.where(eq(familyTable.ownerId, params.familyOwnerId))
		.get();

	if (!family?.familyId) {
		throw new NotAllowedToPerformFamilyAction(`Invalid owner ${params.familyOwnerId}`);
	}

	return await db
		.delete(familyWaitListTable)
		.where(
			and(
				eq(familyWaitListTable.familyId, family.familyId),
				eq(familyWaitListTable.userId, params.waitListMemberId),
			),
		)
		.returning({ familyId: familyWaitListTable.familyId })
		.get();
}
