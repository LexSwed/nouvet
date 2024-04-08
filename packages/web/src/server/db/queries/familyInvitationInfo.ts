'use server';

import { and, eq, sql } from 'drizzle-orm';

import { useDb } from '~/server/db';
import { familyInviteTable, userProfileTable } from '~/server/db/schema';

export async function familyInvitationInfo(inviteCode: string) {
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
