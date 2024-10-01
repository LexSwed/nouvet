"use server";

import { and, desc, eq, gte } from "drizzle-orm";
import { useDb } from "~/server/db";
import {
	activitiesTable,
	activityRelationships,
	appointmentsTable,
	prescriptionsTable,
	userTable,
	utcNow,
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
export async function petActivitiesScheduled(petId: PetID, userId: UserID) {
	const db = useDb();

	checkCanPerformPetAction(petId, userId);

	const petActivities = db
		.select({
			id: activitiesTable.id,
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
				note: activitiesTable.note,
			},
			vaccine: {
				name: vaccinationsTable.name,
				nextDueDate: vaccinationsTable.nextDueDate,
				batchNumber: vaccinationsTable.batchNumber,
				note: activitiesTable.note,
			},
			appointment: {
				location: appointmentsTable.location,
				note: activitiesTable.note,
			},
		})
		.from(activitiesTable)
		/** scheduled activity is the one which:
		 * - for prescriptions: endDate is not passed
		 * - for appointments: date is not passed
		 * - for vaccinations
		 */
		.where(eq(activitiesTable.petId, petId))
		.leftJoin(activityRelationships, eq(activityRelationships.parentActivityId, activitiesTable.id))
		.leftJoin(
			prescriptionsTable,
			and(
				eq(prescriptionsTable.activityId, activitiesTable.id),
				gte(prescriptionsTable.dateCompleted, utcNow()),
			),
		)
		.leftJoin(vaccinationsTable, eq(vaccinationsTable.activityId, activitiesTable.id))
		.leftJoin(
			appointmentsTable,
			and(
				eq(appointmentsTable.activityId, activitiesTable.id),
				gte(activitiesTable.date, utcNow()),
			),
		)
		.leftJoin(userTable, eq(userTable.id, activitiesTable.creatorId))
		.orderBy(desc(activitiesTable.date), desc(vaccinationsTable.nextDueDate))
		.all();

	return petActivities;
}
