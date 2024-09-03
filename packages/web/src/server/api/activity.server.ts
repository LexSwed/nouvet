"use server";

import { json } from "@solidjs/router";
import { Temporal } from "temporal-polyfill";
import { getRequestUser } from "~/server/auth/request-user";
import { type PetActivitiesCursor, petActivities } from "~/server/db/queries/petActivities";
import { activityCreate } from "~/server/db/queries/petActivityCreate";
import type { ActivityCreateSchema } from "~/server/db/queries/petActivityCreate";
import type { PetID } from "~/server/types";
import { jsonFailure } from "~/server/utils";
import { getPetActivities } from "./activity";

export async function getPetActivitiesServer(cursor: PetActivitiesCursor | null, petId: PetID) {
	const currentUser = await getRequestUser();
	if (!petId) {
		throw new Error("petId is not provided");
	}
	try {
		const activities = await petActivities(cursor, petId, currentUser.userId);
		return activities;
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

		const activity = await activityCreate(
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
}
