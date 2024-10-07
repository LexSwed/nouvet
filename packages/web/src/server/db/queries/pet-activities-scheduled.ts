"use server";

import { and, desc, eq, gte, inArray, isNull, or } from "drizzle-orm";
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
			note: activitiesTable.note,
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
			appointment: {
				location: appointmentsTable.location,
			},
		})
		.from(activitiesTable)
		/** scheduled activity is the one which:
		 * - for prescriptions: endDate is not passed
		 * - for appointments: date is not passed
		 * - for vaccinations
		 */
		.where(
			and(
				eq(activitiesTable.petId, petId),
				inArray(activitiesTable.type, ["appointment", "prescription", "vaccination"]),
			),
		)
		.leftJoin(activityRelationships, eq(activityRelationships.parentActivityId, activitiesTable.id))
		.leftJoin(
			prescriptionsTable,
			and(
				eq(prescriptionsTable.activityId, activitiesTable.id),
				or(
					gte(prescriptionsTable.dateCompleted, utcNow()),
					isNull(prescriptionsTable.dateCompleted),
				),
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
		.orderBy(
			desc(vaccinationsTable.nextDueDate),
			desc(prescriptionsTable.dateStarted),
			desc(activitiesTable.date),
		)
		.limit(100)
		.all();

	return petActivities;
}
