'use server';

import { and, eq } from 'drizzle-orm';
import type { DatabaseUser } from 'lucia';

import { useDb } from '~/server/db';
import {
  familyTable,
  familyUserTable,
  familyWaitListTable,
} from '~/server/db/schema';
import {
  InviteeNotInWaitList,
  NotAllowedToPerformFamilyAction,
} from '~/server/errors';

export async function acceptUserToFamily(params: {
  familyOwnerId: DatabaseUser['id'];
  inviteeId: DatabaseUser['id'];
}) {
  const db = useDb();

  const invitee = await db
    .select({
      familyId: familyWaitListTable.familyId,
      inviteeId: familyWaitListTable.userId,
    })
    .from(familyWaitListTable)
    .where(eq(familyWaitListTable.userId, params.inviteeId))
    .get();

  if (!invitee?.inviteeId) {
    throw new InviteeNotInWaitList(`Invalid invitee ID: ${params.inviteeId}`);
  }

  const family = await db
    .select({ id: familyTable.id })
    .from(familyTable)
    .where(eq(familyTable.ownerId, params.familyOwnerId))
    .get();
  if (!family?.id) {
    throw new NotAllowedToPerformFamilyAction(
      `Invalid family owner: ${params.familyOwnerId}`,
    );
  }

  await db
    .insert(familyUserTable)
    .values({
      familyId: family.id,
      userId: invitee.inviteeId,
    })
    .returning({
      userId: familyUserTable.userId,
      familyId: familyUserTable.familyId,
    });

  await db
    .delete(familyWaitListTable)
    .where(
      and(
        eq(familyUserTable.familyId, family.id),
        eq(familyUserTable.userId, params.inviteeId),
      ),
    )
    .get();

  return family;
}
