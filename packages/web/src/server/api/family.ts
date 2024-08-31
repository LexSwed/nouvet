import { action, cache } from "@solidjs/router";

import {
	cancelFamilyJoinServer,
	deleteFamilyServer,
	getFamilyMemberServer,
	getFamilyMembersServer,
	leaveFamilyServer,
	updateFamilyServer,
} from "./family.server";

export const getFamilyMembers = cache(getFamilyMembersServer, "family-members");

export const getFamilyMember = cache(getFamilyMemberServer, "family-member");

export const updateFamily = action(updateFamilyServer, "update-family");

export const deleteFamily = action(deleteFamilyServer, "delete-family");

export const cancelFamilyJoin = action(cancelFamilyJoinServer, "cancel-family-join");

export const leaveFamily = action(leaveFamilyServer, "leave-family");
