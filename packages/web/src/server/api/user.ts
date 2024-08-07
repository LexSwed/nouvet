import { action, cache } from "@solidjs/router";

import { getRequestUser } from "~/server/auth/request-user";
import { userFamily, userProfile } from "~/server/db/queries/userFamily";

import { header as getHeaderLang } from "../i18n/locale";
import { updateUserProfileServer } from "./user.server";

export const getUserFamily = cache(async () => {
	"use server";
	const currentUser = await getRequestUser();

	const user = await userFamily(currentUser.userId);
	if (!user) {
		console.error(`${currentUser.userId} was not resolved from the database`);
		throw Error("Something went wrong");
	}
	return user;
}, "user-family");

export const getUser = cache(async () => {
	"use server";
	const user = await getRequestUser();
	return user;
}, "user");

export const getUserProfile = cache(async () => {
	"use server";
	try {
		const user = await getRequestUser();
		const profile = await userProfile(user.userId);
		const headerLang = await getHeaderLang();

		return {
			...profile,
			isLangNotMatching: headerLang ? headerLang.language !== profile.locale : false,
		};
	} catch (error) {
		console.error(error);
		throw error;
	}
}, "user-profile");

export const updateUserProfile = action(
	async (formData: FormData) => updateUserProfileServer(formData),
	"update-user-profile",
);
