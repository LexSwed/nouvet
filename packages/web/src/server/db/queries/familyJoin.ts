"use server";

import { and, eq, sql } from "drizzle-orm";

import { useDb } from "~/server/db";
import {
	type UserID,
	familyInviteTable,
	familyTable,
	familyUserTable,
	familyWaitListTable,
} from "~/server/db/schema";
import { IncorrectFamilyInvite, UserAlreadyInFamily } from "~/server/errors";

export async function joinFamilyByInvitationHash(invitationHash: string, userId: UserID) {
	return familyJoin(userId, { invitationHash });
}

export async function requestFamilyAdmissionByInviteCode(inviteCode: string, userId: UserID) {
	return familyJoin(userId, { inviteCode });
}

/**
 * Adds @userId into the family behind invite code.
 * invitationHash makes invited user being pre-approved,
 * while inviteCode assumes the user followed the invite link,
 * and hence needs a confirmation first.
 * Invite can only be accepted once, so it's removed as soon as its accepted.
 * There's no expectation for multiple people to read the invite QR code (invitationHash),
 * and the invites are short-lived, so no risk assumed.
 * @throws {IncorrectFamilyInvite} - invite is not found or expired.
 * @throws {UserAlreadyInFamily} - user was already a part of another family.
 */
async function familyJoin(
	userId: UserID,
	params:
		| {
				inviteCode: string;
		  }
		| {
				invitationHash: string;
		  },
) {
	const db = useDb();
	const invite = db
		.select({
			inviteCode: familyInviteTable.inviteCode,
			expiresAt: familyInviteTable.expiresAt,
			inviterId: familyInviteTable.inviterId,
		})
		.from(familyInviteTable)
		.where(
			and(
				"inviteCode" in params
					? eq(familyInviteTable.inviteCode, params.inviteCode)
					: eq(familyInviteTable.invitationHash, params.invitationHash),
				sql`((${familyInviteTable.expiresAt} - unixepoch())) > 0`,
			),
		)
		.get();
	if (!invite) throw new IncorrectFamilyInvite("Incorrect invite");

	await db.delete(familyInviteTable).where(eq(familyInviteTable.inviteCode, invite.inviteCode));

	const existingInvitedUserFamily = await db
		.select({ id: familyUserTable.familyId })
		.from(familyUserTable)
		.where(eq(familyUserTable.userId, userId))
		.get();

	if (existingInvitedUserFamily?.id) {
		throw new UserAlreadyInFamily();
	}

	let family = await db
		.select({ familyId: familyTable.id })
		.from(familyTable)
		.where(eq(familyTable.ownerId, invite.inviterId))
		.get();

	// first time the inviter accepted somebody into the family – create a new family
	if (!family?.familyId) {
		family = db
			.insert(familyTable)
			.values({ ownerId: invite.inviterId })
			.returning({ familyId: familyTable.id })
			.get();

		// add the inviter as a first member of the new family
		await db
			.insert(familyUserTable)
			.values({ userId: invite.inviterId, familyId: family.familyId });
	}

	// delete the user from all possible invites to other families
	await db.delete(familyWaitListTable).where(eq(familyWaitListTable.userId, userId)).run();

	// When joining via QR Code (with hash), the user is added to the family directly.
	if ("invitationHash" in params) {
		await db.insert(familyUserTable).values({ familyId: family.familyId, userId: userId });
	} else {
		// Otherwise they go through the wait list
		await db.insert(familyWaitListTable).values({ familyId: family.familyId, userId: userId });
	}

	return family;
}
