"use server";

import { Temporal } from "temporal-polyfill";
import { useDb } from "~/server/db";
import { familyInviteTable } from "~/server/db/schema";
import type { UserID } from "~/server/types";

/**
 * Creates new invitation code.
 * Similar to OTP, doesn't delete existing invitation codes for some time.
 */
export async function createFamilyInvite(
	inviterId: UserID,
	inviteCode: string,
	invitationHash: string,
) {
	const db = useDb();
	const invite = await db
		.insert(familyInviteTable)
		.values({
			inviterId,
			inviteCode,
			invitationHash,
			expiresAt: Temporal.Now.zonedDateTimeISO("utc").add({ hours: 1 }).epochMilliseconds,
		})
		.returning({
			expiresAt: familyInviteTable.expiresAt,
			inviterId: familyInviteTable.inviterId,
			inviteCode: familyInviteTable.inviteCode,
			invitationHash: familyInviteTable.invitationHash,
		})
		.get();
	return invite;
}
