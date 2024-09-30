"use server";

import { json } from "@solidjs/router";
import { parseISO } from "date-fns";
import { Temporal } from "temporal-polyfill";
import { getRequestUser } from "~/server/auth/request-user";
import { petActivities } from "~/server/db/queries/pet-activities";
import type { PetActivitiesCursor } from "~/server/db/queries/pet-activities";
import { petActivityCreate } from "~/server/db/queries/pet-activity-create";
import type {
	ActivityCreateInput,
	ActivityCreateSchema,
} from "~/server/db/queries/pet-activity-create";
import type { ActivityType, PetID } from "~/server/types";
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

export async function listAllPetActivitiesServer(cursor: PetActivitiesCursor | null, petId: PetID) {
	const currentUser = await getRequestUser();
	if (!petId) {
		throw new Error("petId is not provided");
	}
	try {
		const activities = await petActivities(cursor, petId, currentUser.userId);
		if (activities.length === 0) return {};

		const groupedActivities: { [date: string]: Array<(typeof activities)[number]> } = {};
		const shortFormatter = new Intl.DateTimeFormat(currentUser.locale, {
			day: "numeric",
			month: "short",
		});
		const longFormatter = new Intl.DateTimeFormat(currentUser.locale, {
			// day: "numeric",
			// month: "short",
			timeStyle: "short",
		});

		for (const activity of activities) {
			let date: Date;
			if (activity.type === "appointment") {
				date = parseISO(activity.appointment?.date ?? activity.date);
			} else if (activity.type === "prescription") {
				date = parseISO(activity.prescription?.dateStarted ?? activity.date);
			} else {
				date = parseISO(activity.date);
			}
			const key = shortFormatter.format(date);
			if (!groupedActivities[key]) {
				groupedActivities[key] = [];
			}
			activity.date = longFormatter.format(date);
			groupedActivities[key].push(activity);
		}
		return groupedActivities;
	} catch (error) {
		// TODO: error handling?
		console.error(error);
		throw new Error("Something went wrong");
	}
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
