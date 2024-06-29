import { eq } from "drizzle-orm";

import { useDb } from "~/server/db";
import { type UserID, familyWaitListTable } from "~/server/db/schema";
import { NotAllowedToPerformFamilyAction } from "~/server/errors";

export async function familyCancelJoin(userId: UserID) {
	const db = useDb();

	const family = await db
		.delete(familyWaitListTable)
		.where(eq(familyWaitListTable.userId, userId))
		.returning({ familyId: familyWaitListTable.familyId })
		.get();

	if (!family?.familyId) {
		throw new NotAllowedToPerformFamilyAction("User is not in the waitlist");
	}
	return family;
}
