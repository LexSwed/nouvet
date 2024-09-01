import { aliasedTable, eq } from "drizzle-orm";
import { useDb } from "~/server/db";
import {
	type PetID,
	type UserID,
	activitiesTable,
	activityRelationships,
	userTable,
	vaccinationsTable,
} from "../schema";
import { checkCanPerformPetAction } from "./canPerformPetAction";

const childActivity = aliasedTable(activitiesTable, "childActivity");

export async function getPetActivities(petId: PetID, userId: UserID) {
	checkCanPerformPetAction(petId, userId);

	const db = useDb();

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
		.orderBy(
			activitiesTable.date,
			childActivity.date,
			vaccinationsTable.nextDueDate,
			vaccinationsTable.administeredDate,
		)
		.all();

	return petActivities;
}
