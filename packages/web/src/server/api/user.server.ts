"use server";

import { json } from "@solidjs/router";
import { isValiError } from "valibot";
import { header as getHeaderLang } from "../i18n/locale";

import { getRequestUser } from "~/server/auth/request-user";
import { type UpdateUserSchema, userUpdate } from "~/server/db/queries/userUpdate";

import { useUserSession } from "../auth/user-session";
import { userProfile } from "../db/queries/userFamily";
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
			return json(
				{ failureReason: "validation" as const, errors: await translateErrorTokens(error) },
				{ status: 422, revalidate: [] },
			);
		}
		console.error(error);
		return json({ failureReason: "other" as const }, { status: 500, revalidate: [] });
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
