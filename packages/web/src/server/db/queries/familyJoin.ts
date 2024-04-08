'use server';

import { and, eq, sql } from 'drizzle-orm';

import { useDb } from '~/server/db';
import {
  familyInviteTable,
  familyTable,
  familyUserTable,
  type DatabaseUser,
} from '~/server/db/schema';
import { IncorrectFamilyInvite } from '~/server/errors';

export async function joinFamilyByInvitationHash(
  invitationHash: string,
  userId: DatabaseUser['id'],
) {
  return familyJoin(userId, { invitationHash });
}

export async function requestFamilyAdmissionByInviteCode(
  inviteCode: string,
  userId: DatabaseUser['id'],
) {
  return familyJoin(userId, { inviteCode });
}

/**
 * Adds @userId into the family behind invite code.
 * invitationHash makes invited user being pre-approved,
 * while inviteCode assumes the user followed the invite link,
 * and hence needs a confirmation.
 * Used invites are not removed for rare cases when a user sends the invite to multiple people.
 * There's no expectation for multiple people to read the invite QR code (invitationHash),
 * and the invites are short-lived, so no risk assumed.
 */
async function familyJoin(
  userId: DatabaseUser['id'],
  params:
    | {
        inviteCode: string;
      }
    | {
        invitationHash: string;
      },
) {
  const db = useDb();
  const invite = await db.transaction(async (tx) => {
    const invite = tx
      .select({
        inviteCode: familyInviteTable.inviteCode,
        expiresAt: familyInviteTable.expiresAt,
        inviterId: familyInviteTable.inviterId,
      })
      .from(familyInviteTable)
      .where(
        and(
          'inviteCode' in params
            ? eq(familyInviteTable.inviteCode, params.inviteCode)
            : eq(familyInviteTable.invitationHash, params.invitationHash),
          sql`((${familyInviteTable.expiresAt} - unixepoch())) > 0`,
        ),
      )
      .get();
    if (!invite) throw new IncorrectFamilyInvite('Incorrect invite');

    await tx
      .delete(familyInviteTable)
      .where(eq(familyInviteTable.inviteCode, invite.inviteCode));

    let newFamily = false;
    let family = tx
      .select({ familyId: familyTable.id })
      .from(familyTable)
      .where(eq(familyTable.ownerId, invite.inviterId))
      .get();

    if (!family) {
      newFamily = true;
      family = tx
        .insert(familyTable)
        .values({ ownerId: invite.inviterId })
        .returning({ familyId: familyTable.id })
        .get();
    }
    /** When joining via QR Code (with hash), the user is automatically approved. */
    const approved = 'invitationHash' in params;
    await tx.insert(familyUserTable).values(
      [
        {
          familyId: family.familyId,
          userId: userId,
          approved,
        },
      ].concat(
        newFamily
          ? {
              familyId: family.familyId,
              userId: invite.inviterId,
              approved: true,
            }
          : [],
      ),
    );

    return family;
  });
  return invite;
}
