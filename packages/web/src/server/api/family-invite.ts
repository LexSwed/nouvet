import { action, cache } from "@solidjs/router";

import {
	checkFamilyInviteServer,
	getFamilyInviteServer,
	joinFamilyWithLinkServer,
	joinFamilyWithQRCodeServer,
	moveUserFromTheWaitListServer,
} from "./family-invite.server";

export const getFamilyInvite = cache(getFamilyInviteServer, "family-invite-code");

export const checkFamilyInvite = cache(checkFamilyInviteServer, "check-family-invite");

export const joinFamilyWithLink = action(joinFamilyWithLinkServer, "join-family");

export const joinFamilyWithQRCode = action(joinFamilyWithQRCodeServer, "join-family-qr");

export const moveUserFromTheWaitList = action(
	moveUserFromTheWaitListServer,
	"move-user-from-the-wait-list",
);
