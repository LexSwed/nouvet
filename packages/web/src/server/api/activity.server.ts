"use server";
import { Buffer } from "node:buffer";
import { json } from "@solidjs/router";
import { parseISO } from "date-fns";
import { Temporal } from "temporal-polyfill";
import { getRequestUser } from "~/server/auth/request-user";
import { petActivities } from "~/server/db/queries/pet-activities";
import { petActivityCreate } from "~/server/db/queries/pet-activity-create";
import type {
	ActivityCreateInput,
	ActivityCreateSchema,
} from "~/server/db/queries/pet-activity-create";
import type { DatabaseActivity } from "~/server/db/schema";
import type { ActivityType, PetActivitiesPaginationCursor, PetID } from "~/server/types";
import { jsonFailure } from "~/server/utils";
import { petActivitiesScheduled } from "../db/queries/pet-activities-scheduled";
import { getPetScheduledActivities, listAllPetActivities } from "./activity";

export async function getPetScheduledActivitiesServer(petId: PetID) {
	const currentUser = await getRequestUser();
	if (!petId) {
		throw new Error("petId is not provided");
	}
	try {
		const activities = await petActivitiesScheduled(petId, currentUser.userId);
		console.log(activities);
		return activities;
	} catch (error) {
		// TODO: error handling?
		console.error(error);
		throw new Error("Something went wrong");
	}
}

export async function listAllPetActivitiesServer(
	petId: PetID,
	cursor: PetActivitiesPaginationCursor | null,
) {
	console.log({ cursor });
	const currentUser = await getRequestUser();
	if (!petId) {
		throw new Error("petId is not provided");
	}
	try {
		const activities = await petActivities(
			petId,
			currentUser.userId,
			cursor ? decodeCursor(cursor).lastDate : null,
		);
		if (activities.length === 0) return {};

		// TODO: years
		const dayMonthFormatter = new Intl.DateTimeFormat(currentUser.locale, {
			day: "numeric",
			month: "short",
		});
		const timeFormatter = new Intl.DateTimeFormat(currentUser.locale, {
			timeStyle: "short",
		});

		// const activities =
		// .map((activity) => {
		// 	(activity as typeof activity & { cursor: PetActivitiesCursor }).cursor = encodeCursor(
		// 		activity.date,
		// 	);
		// 	return activity as typeof activity & { cursor: PetActivitiesCursor };
		// });

		const groupedActivities = new Map<
			string,
			Array<(typeof activities)[number] & { time: string }>
		>();

		/**
		 * Latest key added to the map, to add the cursor to the last item only.
		 */
		let latestDateKey = "";
		for (const activity of activities) {
			let date: Date;
			if (activity.type === "prescription") {
				date = parseISO(activity.prescription?.dateStarted ?? activity.date);
			} else {
				date = parseISO(activity.date);
			}
			const key = dayMonthFormatter.format(date);
			latestDateKey = key;
			let dateActivities = groupedActivities.get(key);
			if (!dateActivities) {
				dateActivities = [];
				groupedActivities.set(key, dateActivities);
			}
			dateActivities.push(
				Object.assign(activity, {
					time: timeFormatter.format(date),
				}),
			);
		}

		const latestActivitiy = groupedActivities.get(latestDateKey)?.at(-1);

		return {
			activities: Object.fromEntries(groupedActivities.entries()),
			cursor: latestActivitiy ? encodeCursor(latestActivitiy.date) : null,
		};
	} catch (error) {
		// TODO: error handling?
		console.error(error);
		throw new Error("Something went wrong");
	}
}

function encodeCursor(lastDate: DatabaseActivity["date"]) {
	const cursorData = JSON.stringify({ lastDate });
	return Buffer.from(cursorData).toString("base64") as PetActivitiesPaginationCursor;
}

function decodeCursor(cursor: PetActivitiesPaginationCursor): {
	lastDate: DatabaseActivity["date"];
} {
	const decoded = Buffer.from(cursor, "base64").toString("utf8");
	return JSON.parse(decoded);
}

export async function createPetActivityServer(formData: FormData) {
	const currentUser = await getRequestUser();
	try {
		const petId = formData.get("petId")?.toString();
		if (!petId) {
			throw new Error("petId is not provided");
		}
		let recordedDate = formData.get("recordedDate")!.toString();
		const timeZone = formData.get("currentTimeZone")!.toString();
		recordedDate = Temporal.ZonedDateTime.from(`${recordedDate}[${timeZone}]`).toString();
		const activityType = formData.get("activityType")?.toString() as ActivityType;
		let input: ActivityCreateInput;
		if (activityType === "observation") {
			input = {
				activityType,
				note: formData.get("note")?.toString() || null,
				recordedDate,
			};
		} else if (activityType === "vaccination") {
			input = {
				activityType,
				name: formData.get("name")!.toString(),
				nextDueDate: formData.get("nextDueDate")?.toString() || null,
				batchNumber: formData.get("batchNumber")?.toString() || null,
				note: formData.get("note")?.toString() || null,
				recordedDate,
			};
		} else if (activityType === "appointment") {
			let date = formData.get("date")!.toString();
			const timeZone = formData.get("currentTimeZone")!.toString();
			date = Temporal.ZonedDateTime.from(`${date}[${timeZone}]`).toString();
			input = {
				activityType,
				note: formData.get("note")?.toString() || null,
				recordedDate,
				date,
				location: formData.get("location")!.toString(),
			};
		} else if (activityType === "prescription") {
			input = {
				activityType,
				name: formData.get("name")!.toString(),
				dateStarted: formData.get("dateStarted")!.toString(),
				endDate: formData.get("endDate")?.toString() || null,
				note: formData.get("note")?.toString() || null,
				// TODO: add schedules
				recordedDate,
				schedule: null,
			};
		} else {
			throw new Error("Invalid activity type");
		}

		const activity = await petActivityCreate(input, petId as PetID, currentUser);

		return json(
			{ activity },
			{ revalidate: [listAllPetActivities.key, getPetScheduledActivities.key] },
		);
	} catch (error) {
		return jsonFailure<ActivityCreateSchema>(error);
	}
}
