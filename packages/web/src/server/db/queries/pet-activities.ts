"use server";

import { desc, eq, lt } from "drizzle-orm";
import { useDb } from "~/server/db";
import {
	activitiesTable,
	activityRelationships,
	appointmentsTable,
	prescriptionsTable,
	userTable,
	vaccinationsTable,
} from "~/server/db/schema";
import type { PetID, UserID } from "~/server/types";
import { checkCanPerformPetAction } from "./can-perform-pet-action";

// const childActivity = aliasedTable(activitiesTable, "childActivity");

export async function petActivities(
	petId: PetID,
	userId: UserID,
	/** @see {activitiesTable.date} after which to fetch the activities */
	searchFromDate: string | null,
	limit = 5,
) {
	const db = useDb();

	checkCanPerformPetAction(petId, userId);

	let petActivities = db
		.select({
			id: activitiesTable.id,
			note: activitiesTable.note,
			date: activitiesTable.date,
			type: activitiesTable.type,
			creator: {
				id: userTable.id,
				name: userTable.name,
			},
			prescription: {
				name: prescriptionsTable.name,
				schedule: prescriptionsTable.schedule,
				dateStarted: prescriptionsTable.dateStarted,
				endDate: prescriptionsTable.endDate,
				dateCompleted: prescriptionsTable.dateCompleted,
			},
			vaccine: {
				name: vaccinationsTable.name,
				nextDueDate: vaccinationsTable.nextDueDate,
				batchNumber: vaccinationsTable.batchNumber,
			},
			appointment: {
				location: appointmentsTable.location,
			},
			// child: {
			// 	id: activityRelationships.childActivityId,
			// },
		})
		.from(activitiesTable)
		.where(eq(activitiesTable.petId, petId))
		.leftJoin(activityRelationships, eq(activityRelationships.parentActivityId, activitiesTable.id))
		.leftJoin(prescriptionsTable, eq(prescriptionsTable.activityId, activitiesTable.id))
		.leftJoin(vaccinationsTable, eq(vaccinationsTable.activityId, activitiesTable.id))
		.leftJoin(appointmentsTable, eq(appointmentsTable.activityId, activitiesTable.id))
		.leftJoin(userTable, eq(userTable.id, activitiesTable.creatorId))
		// .leftJoin(childActivity, eq(childActivity.id, activityRelationships.childActivityId))
		.orderBy(desc(activitiesTable.date), desc(vaccinationsTable.nextDueDate))
		.$dynamic();

	if (searchFromDate) {
		petActivities = petActivities.where(lt(activitiesTable.date, searchFromDate));
	}

	return petActivities.limit(limit).all();
}
