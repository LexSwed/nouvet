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

export async function createFamilyInviteAndRemoveOldOnes(
  userId: DatabaseUser['id'],
  inviteHash: string,
) {
  const db = useDb();
  const invite = await db.transaction(async (tx) => {
    // delete any invites created before
    await tx
      .delete(familyInviteTable)
      .where(eq(familyInviteTable.inviterId, userId));

    return await tx
      .insert(familyInviteTable)
      .values({
        inviterId: userId,
        expiresAt: Date.now() / 1000 + new TimeSpan(1, 'h').seconds(),
        inviteCode: inviteHash,
      })
      .returning({
        id: familyInviteTable.id,
        expiresAt: familyInviteTable.expiresAt,
        inviterId: familyInviteTable.inviterId,
        code: familyInviteTable.inviteCode,
      })
      .get();
  });
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
        id: familyInviteTable.id,
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
      .where(eq(familyInviteTable.id, invite.id));

    let family = tx
      .select({ familyId: familyTable.id })
      .from(familyTable)
      .where(eq(familyTable.creatorId, invite.inviterId))
      .get();
    if (!family) {
      family = tx
        .insert(familyTable)
        .values({ creatorId: invite.inviterId })
        .returning({ familyId: familyTable.id })
        .get();
    }
    await tx.insert(familyUserTable).values({
      familyId: family.familyId,
      userId: userId,
      approved: false,
    });

    return family;
  });
  return invite;
}
