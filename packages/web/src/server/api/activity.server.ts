"use server";

import { json } from "@solidjs/router";
import { Temporal } from "temporal-polyfill";
import { getRequestUser } from "~/server/auth/request-user";
import { activityCreate } from "~/server/db/queries/petActivityCreate";
import type { ActivityCreateSchema } from "~/server/db/queries/petActivityCreate";
import { jsonFailure } from "~/server/utils";

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
			petId,
			currentUser.userId,
		);
		return json({ activity }, { revalidate: [] });
	} catch (error) {
		return jsonFailure<ActivityCreateSchema>(error);
	}
}
