import { and, eq, inArray } from "drizzle-orm";
import { useDb } from "~/server/db";
import { PetActionNotAllowed } from "~/server/errors";
import {
	type PetID,
	type UserID,
	activitiesTable,
	activityRelationships,
	childActivity,
	familyUserTable,
	petTable,
	userTable,
	vaccinationsTable,
} from "../schema";

export async function getPetActivities(petId: PetID, userId: UserID) {
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
		.where(and(eq(petTable.id, petId), inArray(petTable.ownerId, familyUsers)))
		.get();

	if (!isPetInFamily) {
		throw new PetActionNotAllowed();
	}

	const petActivities = await db
		.select({
			id: activitiesTable.id,
			note: activitiesTable.note,
			date: activitiesTable.date,
			type: activitiesTable.type,
			creator: {
				id: userTable.id,
				name: userTable.name,
			},
			vaccine: {
				name: vaccinationsTable.name,
				administeredDate: vaccinationsTable.administeredDate,
				nextDueDate: vaccinationsTable.nextDueDate,
				batchNumber: vaccinationsTable.batchNumber,
			},
		})
		.from(activitiesTable)
		.where(eq(activitiesTable.petId, petId))
		.leftJoin(activityRelationships, eq(activitiesTable.id, activityRelationships.parentActivityId))
		.leftJoin(childActivity, eq(childActivity.id, activityRelationships.childActivityId))
		.leftJoin(vaccinationsTable, eq(vaccinationsTable.activityId, activitiesTable.id))
		.leftJoin(userTable, eq(userTable.id, activitiesTable.creatorId))
		.leftJoin(petTable, eq(petTable.id, activitiesTable.petId))
		.orderBy(
			activitiesTable.date,
			childActivity.date,
			vaccinationsTable.nextDueDate,
			vaccinationsTable.administeredDate,
		)
		.all();

	return petActivities;
}
