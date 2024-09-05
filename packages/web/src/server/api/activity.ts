import { action, cache, json } from "@solidjs/router";
import { Temporal } from "temporal-polyfill";
import { getRequestUser } from "~/server/auth/request-user";
import { type PetActivitiesCursor, petActivities } from "~/server/db/queries/petActivities";
import { petActivityCreate } from "~/server/db/queries/petActivityCreate";
import type { ActivityCreateSchema } from "~/server/db/queries/petActivityCreate";
import type { PetID } from "~/server/types";
import { jsonFailure } from "~/server/utils";

export const getPetActivities = cache(async function getPetActivitiesServer(
	cursor: PetActivitiesCursor | null,
	petId: PetID,
) {
	"use server";
	const currentUser = await getRequestUser();
	if (!petId) {
		throw new Error("petId is not provided");
	}
	try {
		const activities = await petActivities(cursor, petId, currentUser.userId);
		if (activities.length === 0) return {};

		const groupedActivities: { [key: string]: Array<(typeof activities)[number]> } = {};
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
			const date = Temporal.ZonedDateTime.from(activity.date);
			const key = shortFormatter.format(date.epochMilliseconds);
			if (!groupedActivities[key]) {
				groupedActivities[key] = [];
			}
			activity.date = longFormatter.format(date.epochMilliseconds);
			groupedActivities[key].push(activity);
		}
		return groupedActivities;
	} catch (error) {
		// TODO: error handling?
		console.error(error);
		throw new Error("Something went wrong");
	}
}, "get-pet-activities");

export const createPetActivity = action(async function createPetActivityServer(formData: FormData) {
	"use server";
	const currentUser = await getRequestUser();
	try {
		const petId = formData.get("petId")?.toString();
		if (!petId) {
			throw new Error("petId is not provided");
		}
		let recordedDate: string | null = null;
		try {
			recordedDate = formData.get("recordedDate")?.toString() || null;
			const timeZone = formData.get("currentTimeZone")?.toString() || null;
			if (recordedDate && timeZone) {
				recordedDate = Temporal.ZonedDateTime.from(`${recordedDate}[${timeZone}]`).toString();
			}
		} catch (error) {
			console.error(error);
		}

		const activity = await petActivityCreate(
			{
				activityType: formData.get("activityType"),
				note: formData.get("note") || null,
				recordedDate,
			},
			petId as PetID,
			currentUser,
		);
		return json({ activity }, { revalidate: [getPetActivities.key] });
	} catch (error) {
		return jsonFailure<ActivityCreateSchema>(error);
	}
}, "create-pet-activity");
