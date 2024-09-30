"use server";

import { desc, eq, gt } from "drizzle-orm";
import { useDb } from "~/server/db";
import {
	type DatabaseActivity,
	activitiesTable,
	activityRelationships,
	appointmentsTable,
	prescriptionsTable,
	userTable,
	vaccinationsTable,
} from "~/server/db/schema";
import type { Branded, PetID, UserID } from "~/server/types";
import { checkCanPerformPetAction } from "./can-perform-pet-action";

// const childActivity = aliasedTable(activitiesTable, "childActivity");

export async function petActivities(
	cursor: PetActivitiesCursor | null,
	petId: PetID,
	userId: UserID,
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
		.where(eq(activitiesTable.petId, petId))
		.leftJoin(activityRelationships, eq(activityRelationships.parentActivityId, activitiesTable.id))
		.leftJoin(prescriptionsTable, eq(prescriptionsTable.activityId, activitiesTable.id))
		.leftJoin(vaccinationsTable, eq(vaccinationsTable.activityId, activitiesTable.id))
		.leftJoin(appointmentsTable, eq(appointmentsTable.activityId, activitiesTable.id))
		.leftJoin(userTable, eq(userTable.id, activitiesTable.creatorId))
		// .leftJoin(childActivity, eq(childActivity.id, activityRelationships.childActivityId))
		.orderBy(desc(activitiesTable.date), desc(vaccinationsTable.nextDueDate))
		.$dynamic();

	if (cursor) {
		const { lastDate } = decodeCursor(cursor);
		petActivities = petActivities.where(gt(activitiesTable.date, lastDate));
	}

	const activities = petActivities
		.limit(50)
		.all()
		.map((activity) => {
			(activity as typeof activity & { cursor: PetActivitiesCursor }).cursor = encodeCursor(
				activity.date,
			);
			return activity as typeof activity & { cursor: PetActivitiesCursor };
		});

	return activities;
}

export type PetActivitiesCursor = Branded<string, "PetActivitiesCursor">;

function encodeCursor(lastDate: DatabaseActivity["date"]) {
	const cursorData = JSON.stringify({ lastDate });
	return Buffer.from(cursorData).toString("base64") as PetActivitiesCursor;
}

function decodeCursor(cursor: PetActivitiesCursor): { lastDate: DatabaseActivity["date"] } {
	const decoded = Buffer.from(cursor, "base64").toString("utf8");
	return JSON.parse(decoded);
}
