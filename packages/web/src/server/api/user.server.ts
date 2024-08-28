"use server";
import { header as getHeaderLang, getLocale } from "../i18n/locale";

import { getRequestUser } from "~/server/auth/request-user";
import { type UpdateUserSchema, userUpdate } from "~/server/db/queries/userUpdate";

import { getRequestEvent } from "solid-js/web";
import { useUserSession } from "../auth/user-session";
import { userProfile } from "../db/queries/userFamily";
import { jsonFailure } from "../utils";

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
		const event = getRequestEvent();
		event!.locals.locale = await getLocale();
		// revalidate all
		return user;
	} catch (error) {
		return jsonFailure<UpdateUserSchema>(error);
	}
}

export async function getUserProfileServer() {
	try {
		const user = await getRequestUser();
		const profile = await userProfile(user.userId);
		const headerLang = getHeaderLang();

		return {
			...profile,
			isLangNotMatching: headerLang ? headerLang.language !== profile.locale : false,
		};
	} catch (error) {
		console.error(error);
		throw error;
	}
}
