"use server";

import { json } from "@solidjs/router";
import { isValiError } from "valibot";

import { getRequestUser } from "~/server/auth/request-user";
import { type UpdateUserSchema, userUpdate } from "~/server/db/queries/userUpdate";

import { useUserSession } from "../auth/user-session";
import { translateErrorTokens } from "../utils";

export async function updateUserProfileServer(formData: FormData) {
	const currentUser = await getRequestUser();
	try {
		const user = await userUpdate(currentUser.userId, {
			name: formData.get("name"),
			locale: formData.get("locale"),
			measurementSystem: formData.get("measurementSystem"),
		});
		const session = await useUserSession();
		await session.update({
			...session.data,
			locale: user.locale,
			measurementSystem: user.measurementSystem,
		});
		return user;
	} catch (error) {
		if (isValiError<UpdateUserSchema>(error)) {
			return json({ errors: await translateErrorTokens(error) }, { status: 422, revalidate: [] });
		}
		console.error(error);
		return json({ failed: true }, { status: 500, revalidate: [] });
	}
}
