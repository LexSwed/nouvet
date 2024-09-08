import { eq } from "drizzle-orm";

import { useDb } from "~/server/db";
import { familyWaitListTable } from "~/server/db/schema";
import { NotAllowedToPerformFamilyAction } from "~/server/errors";
import type { UserID } from "~/server/types";

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
