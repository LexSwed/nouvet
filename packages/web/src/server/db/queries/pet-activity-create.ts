"use server";
import * as v from "valibot";
import type { UserSession } from "~/server/auth/user-session";
import { useDb } from "~/server/db";
import {
	type DosageBase,
	type InjectionDosage,
	type LiquidDosage,
	type ScheduleDuration,
	activitiesTable,
	prescriptionsTable,
	vaccinationsTable,
} from "~/server/db/schema";
import type { ActivityType, PetID, PrescriptionMedicationType } from "~/server/types";
import { getCurrentZonedDateTime } from "~/server/utils";
import { checkCanPerformPetAction } from "./can-perform-pet-action";

const ActivityNoteSchema = v.nullable(v.pipe(v.string(), v.trim(), v.maxLength(1000)));
const PrescriptionDurationSchema = v.nullable(
	v.object({
		amount: v.number(),
		unit: v.picklist(["day", "week", "month", "year"] as const satisfies Array<
			ScheduleDuration["unit"]
		>),
	}),
);
const PrescriptionTimeSchema = v.nullable(
	v.picklist(["morning", "afternoon", "evening", "night"] as const satisfies Array<
		DosageBase["time"]
	>),
);

const ActivityCreateSchema = v.variant("activityType", [
	v.object({
		activityType: v.literal("observation" satisfies ActivityType),
		note: ActivityNoteSchema,
		// TODO: ZonedDateTime validation
		recordedDate: v.nullable(v.string()),
	}),
	v.object({
		activityType: v.literal("vaccination" satisfies ActivityType),
		name: v.pipe(v.string(), v.trim(), v.maxLength(200)),
		note: ActivityNoteSchema,
		// TODO: ZonedDateTime validation
		recordedDate: v.nullable(v.string()),
		nextDueDate: v.nullable(v.pipe(v.string(), v.isoDate())),
		batchNumber: v.nullable(v.pipe(v.string(), v.trim(), v.maxLength(100))),
	}),
	v.object({
		activityType: v.literal("prescription" satisfies ActivityType),
		name: v.pipe(v.string(), v.trim(), v.maxLength(200)),
		note: ActivityNoteSchema,
		// TODO: ZonedDateTime validation
		recordedDate: v.nullable(v.string()),
		dateStarted: v.nullable(v.pipe(v.string(), v.isoDate())),
		schedule: v.nullable(
			v.variant("type", [
				v.object({
					type: v.literal("pill" satisfies PrescriptionMedicationType),
					duration: PrescriptionDurationSchema,
					dosage: v.nullable(
						v.array(v.object({ time: PrescriptionTimeSchema, amount: v.number() })),
					),
				}),
				v.object({
					type: v.literal("injection" satisfies PrescriptionMedicationType),
					duration: PrescriptionDurationSchema,
					dosage: v.nullable(
						v.array(
							v.object({
								time: PrescriptionTimeSchema,
								amount: v.number(),
								unit: v.picklist(["ml", "mg", "unit"] satisfies Array<InjectionDosage["unit"]>),
							}),
						),
					),
				}),
				v.object({
					type: v.literal("liquid" satisfies PrescriptionMedicationType),
					duration: PrescriptionDurationSchema,
					dosage: v.nullable(
						v.array(
							v.object({
								time: PrescriptionTimeSchema,
								amount: v.number(),
								unit: v.picklist(["ml", "tbsp", "tsp"] satisfies Array<LiquidDosage["unit"]>),
							}),
						),
					),
				}),
				v.object({
					type: v.literal("ointment" satisfies PrescriptionMedicationType),
					duration: PrescriptionDurationSchema,
					dosage: v.nullable(
						v.array(
							v.object({
								time: PrescriptionTimeSchema,
								amount: v.pipe(v.string(), v.trim(), v.maxLength(100)),
							}),
						),
					),
				}),
				v.object({
					type: v.literal("other" satisfies PrescriptionMedicationType),
					duration: PrescriptionDurationSchema,
					dosage: v.nullable(
						v.array(
							v.object({
								time: PrescriptionTimeSchema,
								amount: v.pipe(v.string(), v.trim(), v.maxLength(100)),
							}),
						),
					),
				}),
			]),
		),
	}),
]);

export type ActivityCreateSchema = typeof ActivityCreateSchema;
type ActivityCreateInput = v.InferInput<ActivityCreateSchema>;

export async function petActivityCreate(
	activityData: {
		[K in keyof ActivityCreateInput]?: unknown;
	},
	petId: PetID,
	user: UserSession,
) {
	checkCanPerformPetAction(petId, user.userId);

	const db = useDb();

	const activityInfo = v.parse(ActivityCreateSchema, activityData);

	const activity = db.transaction(async (tx) => {
		const activity = tx
			.insert(activitiesTable)
			.values({
				petId,
				creatorId: user.userId,
				note: activityInfo.note,
				type: activityInfo.activityType,
				date: activityInfo.recordedDate ?? getCurrentZonedDateTime(user.timeZoneId).toString(),
			})
			.returning({ id: activitiesTable.id })
			.get();

		switch (activityInfo.activityType) {
			case "prescription":
				tx.insert(prescriptionsTable).values({
					activityId: activity.id,
					name: activityInfo.name,
					schedule: activityInfo.schedule,
					dateStarted: activityInfo.dateStarted,
				});
				break;
			case "vaccination":
				tx.insert(vaccinationsTable).values({
					activityId: activity.id,
					name: activityInfo.name,
					nextDueDate: activityInfo.nextDueDate,
					batchNumber: activityInfo.batchNumber,
				});
				break;
			case "observation":
				break;
		}
		return activity;
	});

	return activity;
}
