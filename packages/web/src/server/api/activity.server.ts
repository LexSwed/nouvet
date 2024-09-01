"use server";

import { json } from "@solidjs/router";
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
		const activity = await activityCreate(
			{
				type: formData.get("activity-type"),
				note: formData.get("note"),
				date: formData.get("date"),
			},
			petId,
			currentUser.userId,
		);
		return json({ activity }, { revalidate: [] });
	} catch (error) {
		return jsonFailure<ActivityCreateSchema>(error);
	}
}
