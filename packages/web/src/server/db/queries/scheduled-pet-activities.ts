"use server";

import { and, desc, eq, gte } from "drizzle-orm";
import { useDb } from "~/server/db";
import {
	activitiesTable,
	activityRelationships,
	prescriptionsTable,
	userTable,
	vaccinationsTable,
} from "~/server/db/schema";
import type { PetID, UserID } from "~/server/types";
import { checkCanPerformPetAction } from "./can-perform-pet-action";

// const childActivity = aliasedTable(activitiesTable, "childActivity");

/**
 * A list of all activities that were not finished:
 * - medications
 * - vaccinations
 * - doctor's appointments
 */
export async function scheduledPetActivites(petId: PetID, userId: UserID) {
	const db = useDb();

	checkCanPerformPetAction(petId, userId);

	const petActivities = db
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
			},
			vaccine: {
				name: vaccinationsTable.name,
				nextDueDate: vaccinationsTable.nextDueDate,
				batchNumber: vaccinationsTable.batchNumber,
			},
			// child: {
			// 	id: activityRelationships.childActivityId,
			// },
		})
		.from(activitiesTable)
		/** scheduled activity is the one which:
		 * - for prescriptions: endDate is not passed
		 * - for appointments: date is not passed
		 * - for vaccinations 
		 */
		.where(and(eq(activitiesTable.petId, petId), gte(prescriptionsTable.)))
		.leftJoin(activityRelationships, eq(activityRelationships.parentActivityId, activitiesTable.id))
		.leftJoin(prescriptionsTable, eq(prescriptionsTable.activityId, activitiesTable.id))
		// .leftJoin(childActivity, eq(childActivity.id, activityRelationships.childActivityId))
		.leftJoin(vaccinationsTable, eq(vaccinationsTable.activityId, activitiesTable.id))
		.leftJoin(userTable, eq(userTable.id, activitiesTable.creatorId))
		.orderBy(desc(activitiesTable.date), desc(vaccinationsTable.nextDueDate)).all()

	return petActivities;
}
