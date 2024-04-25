'use server';

import { TimeSpan } from 'lucia';

import { useDb } from '~/server/db';
import { familyInviteTable, type DatabaseUser } from '~/server/db/schema';

/**
 * Creates new invitation code.
 * Similar to OTP, doesn't delete existing invitation codes for some time.
 */
export async function createFamilyInvite(
  inviterId: DatabaseUser['id'],
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
      expiresAt: Math.floor(Date.now() / 1000) + new TimeSpan(1, 'h').seconds(),
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
