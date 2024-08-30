"use server";

import { and, eq } from "drizzle-orm";

import { useDb } from "~/server/db";
import { type UserID, familyTable, familyUserTable, familyWaitListTable } from "~/server/db/schema";
import { InviteeNotInWaitList, NotAllowedToPerformFamilyAction } from "~/server/errors";

export async function acceptUserToFamily(params: {
	familyOwnerId: UserID;
	inviteeId: UserID;
}) {
	const db = useDb();

	const invitee = await db
		.select({
			familyId: familyWaitListTable.familyId,
			inviteeId: familyWaitListTable.userId,
		})
		.from(familyWaitListTable)
		.where(eq(familyWaitListTable.userId, params.inviteeId))
		.get();

	if (!invitee?.inviteeId) {
		throw new InviteeNotInWaitList(`Invalid invitee ID: ${params.inviteeId}`);
	}

	const family = await db
		.select({ familyId: familyTable.id })
		.from(familyTable)
		.where(and(eq(familyTable.id, invitee.familyId), eq(familyTable.ownerId, params.familyOwnerId)))
		.get();

	if (!family?.familyId) {
		throw new NotAllowedToPerformFamilyAction(`Invalid family owner: ${params.familyOwnerId}`);
	}

	await db.insert(familyUserTable).values({
		familyId: family.familyId,
		userId: invitee.inviteeId,
	});

	await db
		.delete(familyWaitListTable)
		.where(
			and(
				eq(familyWaitListTable.familyId, family.familyId),
				eq(familyWaitListTable.userId, params.inviteeId),
			),
		);

	return family;
}
