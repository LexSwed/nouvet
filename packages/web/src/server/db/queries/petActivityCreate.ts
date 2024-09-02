import * as v from "valibot";

import { useDb } from "~/server/db";
import { type ActivityType, type PetID, type UserID, activitiesTable } from "../schema";
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
	userId: UserID,
) {
	checkCanPerformPetAction(petId, userId);

	const db = useDb();

	const activityInfo = v.parse(ActivityCreateSchema, activityData);

	const pet = await db
		.update(activitiesTable)
		.set({
			petId,
			creatorId: userId,
			note: activityInfo.note,
			type: activityInfo.activityType,
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
