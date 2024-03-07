'use server';

import { and, eq, sql } from 'drizzle-orm';
import { TimeSpan } from 'lucia';

import { useDb } from '~/server/db';
import { familyInviteTable, type DatabaseUser } from '~/server/db/schema';

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

export async function joinFamilyByInviteCode(
  userId: DatabaseUser['id'],
  inviteCode: string,
) {
  const db = useDb();
  const invite = await db.transaction((tx) => {
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
    if (invite) {
      tx.delete(familyInviteTable).where(eq(familyInviteTable.id, invite.id));
    }
    // new table for people who are waiting to be approved to join the family?
    return invite;
  });
  return invite;
}
