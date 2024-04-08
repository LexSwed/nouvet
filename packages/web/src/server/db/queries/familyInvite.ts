'use server';

import { and, eq, sql } from 'drizzle-orm';

import { useDb } from '~/server/db';
import { familyInviteTable, type DatabaseUser } from '~/server/db/schema';

export async function familyInvite(userId: DatabaseUser['id']) {
  const db = useDb();
  const invite = await db
    .select({
      expiresAt: familyInviteTable.expiresAt,
      inviterId: familyInviteTable.inviterId,
      inviteCode: familyInviteTable.inviteCode,
      invitationHash: familyInviteTable.invitationHash,
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
