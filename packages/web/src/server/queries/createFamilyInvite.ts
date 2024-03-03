import { createId } from '@paralleldrive/cuid2';
import { and, eq, sql } from 'drizzle-orm';

import { useDb } from '~/server/db';
import { familyInviteTable, type DatabaseUser } from '~/server/db/schema';

export async function createFamilyInvite(userId: DatabaseUser['id']) {
  const db = useDb();
  const invite = await db.transaction(async (tx) => {
    const invite = await tx
      .select({
        id: familyInviteTable.id,
        expiresAt: familyInviteTable.expiresAt,
        inviterId: familyInviteTable.inviterId,
      })
      .from(familyInviteTable)
      .where(
        and(
          eq(familyInviteTable.inviterId, userId),
          // expires in more than 4 minutes
          sql`((${familyInviteTable.expiresAt} - unixepoch()) / 60) > 4`,
        ),
      )
      .get();

    if (invite) return invite;

    return await tx
      .insert(familyInviteTable)
      .values({ id: createId(), inviterId: userId })
      .returning({
        id: familyInviteTable.id,
        expiresAt: familyInviteTable.expiresAt,
        inviterId: familyInviteTable.inviterId,
      })
      .get();
  });
  return invite;
}
