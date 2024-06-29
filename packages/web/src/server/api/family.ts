import { action, cache } from "@solidjs/router";

import {
	cancelFamilyJoinServer,
	deleteFamilyServer,
	getFamilyMemberServer,
	getFamilyMembersServer,
	leaveFamilyServer,
	updateFamilyServer,
} from "./family.server";

export const getFamilyMembers = cache(async () => getFamilyMembersServer(), "family-members");

export const getFamilyMember = cache(
	async (memberId: unknown) => getFamilyMemberServer(memberId),
	"family-member",
);

export const updateFamily = action(
	(formData: FormData) => updateFamilyServer(formData),
	"update-family",
);

export const deleteFamily = action(() => deleteFamilyServer(), "delete-family");

export const cancelFamilyJoin = action(() => cancelFamilyJoinServer(), "cancel-family-join");

export const leaveFamily = action(() => leaveFamilyServer(), "leave-family");
