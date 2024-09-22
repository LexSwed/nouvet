"use server";
import { Temporal } from "temporal-polyfill";
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
import { type ErrorKeys, getCurrentZonedDateTime } from "~/server/utils";
import { checkCanPerformPetAction } from "./can-perform-pet-action";

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

const ActivityNoteSchema = v.nullable(
	v.config(v.pipe(v.string(), v.trim(), v.maxLength(1000)), {
		message: "create-activity.note" satisfies ErrorKeys,
	}),
);
const ActivityRecordedDateSchema = v.config(
	v.pipe(
		v.string(),
		v.trim(),
		v.check((value) => {
			try {
				const currentYear = new Date().getFullYear();
				const date = Temporal.ZonedDateTime.from(value);
				return date.year >= currentYear - 100 && date.year <= currentYear + 100;
			} catch {
				return false;
			}
		}),
	),
	{ message: "create-activity.recordedDate" satisfies ErrorKeys },
);

// TODO: localised string errors, validation for ZonedDateTime that adds timezoneID

const ActivityCreateSchema = v.variant("activityType", [
	v.object({
		activityType: v.literal("observation" satisfies ActivityType),
		note: ActivityNoteSchema,
		recordedDate: ActivityRecordedDateSchema,
	}),
	v.object({
		activityType: v.literal("vaccination" satisfies ActivityType),
		note: ActivityNoteSchema,
		recordedDate: ActivityRecordedDateSchema,
		name: v.pipe(
			v.string("create-activity.vaccine.name" satisfies ErrorKeys),
			v.trim(),
			v.minLength(2, "create-activity.vaccine.name-short" satisfies ErrorKeys),
			v.maxLength(400, "create-activity.vaccine.name-long" satisfies ErrorKeys),
		),
		nextDueDate: v.nullable(
			v.config(v.pipe(v.string(), v.isoDate()), {
				message: "create-activity.vaccine.due-date" satisfies ErrorKeys,
			}),
		),
		batchNumber: v.nullable(
			v.config(v.pipe(v.string(), v.trim(), v.maxLength(100)), {
				message: "create-activity.vaccine.due-date" satisfies ErrorKeys,
			}),
		),
	}),
	v.object({
		activityType: v.literal("appointment" satisfies ActivityType),
		note: ActivityNoteSchema,
		recordedDate: ActivityRecordedDateSchema,
		date: v.config(ActivityRecordedDateSchema, {
			message: "create-activity.appointment.date" satisfies ErrorKeys,
		}),
		location: v.config(v.pipe(v.string(), v.trim(), v.maxLength(400)), {
			message: "create-activity.appointment.location" satisfies ErrorKeys,
		}),
	}),
	v.object({
		activityType: v.literal("prescription" satisfies ActivityType),
		note: ActivityNoteSchema,
		recordedDate: ActivityRecordedDateSchema,
		name: v.pipe(
			v.string(),
			v.trim(),
			v.minLength(2, "create-activity.prescription.name-required" satisfies ErrorKeys),
			v.maxLength(200, "create-activity.prescription.name-length" satisfies ErrorKeys),
		),
		dateStarted: v.nullable(
			v.config(v.pipe(v.string(), v.isoDate()), {
				message: "create-activity.prescription.date-started" satisfies ErrorKeys,
			}),
		),
		schedule: v.nullable(
			v.config(
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
				{ message: "create-activity.prescription.schedule" satisfies ErrorKeys },
			),
		),
	}),
]);

export type ActivityCreateSchema = typeof ActivityCreateSchema;
export type ActivityCreateInput = v.InferInput<ActivityCreateSchema>;

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
