'use server';

import { and, eq, sql } from 'drizzle-orm';
import { TimeSpan } from 'lucia';

import { useDb } from '~/server/db';
import {
  familyInviteTable,
  familyTable,
  familyUserTable,
  userProfileTable,
  type DatabaseUser,
} from '~/server/db/schema';
import { IncorrectFamilyInvite } from '~/server/errors';

export async function getFamilyInvite(userId: DatabaseUser['id']) {
  const db = useDb();
  const invite = await db
    .select({
      expiresAt: familyInviteTable.expiresAt,
      inviterId: familyInviteTable.inviterId,
      inviteCode: familyInviteTable.inviteCode,
    })
    .from(familyInviteTable)
    .where(
      and(
        eq(familyInviteTable.inviterId, userId),
        // expires in more than 5 minutes
        sql`((${familyInviteTable.expiresAt} - unixepoch())) > 300`,
      ),
    )
    .get();
  return invite;
}

/**
 * Creates new invitation code.
 * Similar to OTP, doesn't delete existing invitation codes
 * that could still be valid for 5 minutes as per @getFamilyInvite query.
 */
export async function createFamilyInvite(
  userId: DatabaseUser['id'],
  inviteHash: string,
) {
  const db = useDb();
  const invite = await db
    .insert(familyInviteTable)
    .values({
      inviterId: userId,
      expiresAt: Date.now() / 1000 + new TimeSpan(1, 'h').seconds(),
      inviteCode: inviteHash,
    })
    .returning({
      expiresAt: familyInviteTable.expiresAt,
      inviterId: familyInviteTable.inviterId,
      inviteCode: familyInviteTable.inviteCode,
    })
    .get();
  return invite;
}

export async function getFamilyInvitationInfo(inviteCode: string) {
  const db = useDb();
  const invite = await db
    .select({ inviterName: userProfileTable.name })
    .from(userProfileTable)
    .where(
      eq(
        userProfileTable.userId,
        db
          .select({ userId: familyInviteTable.inviterId })
          .from(familyInviteTable)
          .where(
            and(
              eq(familyInviteTable.inviteCode, inviteCode),
              sql`((${familyInviteTable.expiresAt} - unixepoch())) > 0`,
            ),
          ),
      ),
    )
    .get();

  return invite;
}

export async function joinFamilyByInviteCode(
  userId: DatabaseUser['id'],
  inviteCode: string,
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
          eq(familyInviteTable.inviteCode, inviteCode),
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
      .where(eq(familyTable.creatorId, invite.inviterId))
      .get();
    if (!family) {
      newFamily = true;
      family = tx
        .insert(familyTable)
        .values({ creatorId: invite.inviterId })
        .returning({ familyId: familyTable.id })
        .get();
    }
    await tx.insert(familyUserTable).values(
      [
        {
          familyId: family.familyId,
          userId: userId,
          approved: false,
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
