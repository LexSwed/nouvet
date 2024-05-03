'use server';

import { and, eq, sql } from 'drizzle-orm';

import { useDb } from '~/server/db';
import {
  familyInviteTable,
  familyUserTable,
  userTable,
  type DatabaseUser,
} from '~/server/db/schema';
import { UserAlreadyInFamily } from '~/server/errors';

/**
 * Finds the invite by the code from the invite link.
 * @throws {UserAlreadyInFamily} when user is already part of another family.
 */
export async function familyInvitationInfo(
  inviteCode: string,
  inviteeId: DatabaseUser['id'],
) {
  const db = useDb();
  const existingUserFamily = await db
    .select({ familyId: familyUserTable.familyId })
    .from(familyUserTable)
    .where(eq(familyUserTable.userId, inviteeId))
    .get();

  if (existingUserFamily) throw new UserAlreadyInFamily();

  const invite = await db
    .select({ inviterName: userTable.name })
    .from(userTable)
    .where(
      eq(
        userTable.id,
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
