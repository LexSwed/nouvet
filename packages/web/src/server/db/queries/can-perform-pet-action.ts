import { and, eq, inArray, or } from "drizzle-orm";
import { useDb } from "~/server/db";
import { familyUserTable, petTable } from "~/server/db/schema";
import { PetActionNotAllowed } from "~/server/errors";
import type { PetID, UserID } from "~/server/types";

export function checkCanPerformPetAction(petId: PetID, userId: UserID) {
	const db = useDb();
	const familyUsers = db
		.select({ userId: familyUserTable.userId })
		.from(familyUserTable)
		.where(
			eq(
				familyUserTable.familyId,
				db
					.select({ familyId: familyUserTable.familyId })
					.from(familyUserTable)
					.where(eq(familyUserTable.userId, userId)),
			),
		);

	const isPetInFamily = db
		.select({ id: petTable.id })
		.from(petTable)
		.where(
			and(
				eq(petTable.id, petId),
				or(
					// when there's no family
					eq(petTable.ownerId, userId),
					inArray(petTable.ownerId, familyUsers),
				),
			),
		)
		.get();

	if (!isPetInFamily) {
		throw new PetActionNotAllowed();
	}
}
