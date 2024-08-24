import { action, cache } from "@solidjs/router";

import { getRequestUser } from "~/server/auth/request-user";
import { userFamily } from "~/server/db/queries/userFamily";

import { getUserProfileServer, updateUserProfileServer } from "./user.server";

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

export const getUserProfile = cache(getUserProfileServer, "user-profile");

export const updateUserProfile = action(updateUserProfileServer, "update-user-profile");
