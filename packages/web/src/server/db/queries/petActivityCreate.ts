"use server";
import * as v from "valibot";
import type { UserSession } from "~/server/auth/user-session";
import { useDb } from "~/server/db";
import type { ActivityType, PetID } from "~/server/types";
import { getCurrentZonedDateTime } from "~/server/utils";
import { activitiesTable } from "../schema";
import { checkCanPerformPetAction } from "./canPerformPetAction";

const ActivityCreateSchema = v.variant("activityType", [
	v.object({
		activityType: v.literal("observation" satisfies ActivityType),
		note: v.nullable(v.pipe(v.string(), v.trim(), v.maxLength(1000))),
		// TODO: ZonedDateTime validation
		recordedDate: v.nullable(v.string()),
	}),
]);

export type ActivityCreateSchema = typeof ActivityCreateSchema;
type ActivityCreateInput = v.InferInput<ActivityCreateSchema>;

export async function activityCreate(
	activityData: {
		[K in keyof ActivityCreateInput]?: unknown;
	},
	petId: PetID,
	user: UserSession,
) {
	checkCanPerformPetAction(petId, user.userId);

	const db = useDb();

	const activityInfo = v.parse(ActivityCreateSchema, activityData);

	const pet = await db
		.insert(activitiesTable)
		.values({
			petId,
			creatorId: user.userId,
			note: activityInfo.note,
			type: activityInfo.activityType,
			date: activityInfo.recordedDate ?? getCurrentZonedDateTime(user.timeZoneId).toString(),
		})
		.returning({
			id: activitiesTable.id,
			name: activitiesTable.note,
			type: activitiesTable.type,
			date: activitiesTable.date,
		})
		.get();

	return pet;
}
