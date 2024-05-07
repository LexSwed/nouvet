'use server';

import { and, eq } from 'drizzle-orm';

import {
  familyTable,
  familyWaitListTable,
  type DatabaseUser,
} from '~/server/db/schema';
import { NotAllowedToPerformFamilyAction } from '~/server/errors';

import { useDb } from '..';

export async function familyRemoveFromWaitList(params: {
  familyOwnerId: DatabaseUser['id'];
  waitListMemberId: DatabaseUser['id'];
}) {
  const db = useDb();

  const family = await db
    .select({ id: familyTable.id })
    .from(familyTable)
    .where(eq(familyTable.ownerId, params.familyOwnerId))
    .get();

  if (!family?.id) {
    throw new NotAllowedToPerformFamilyAction(
      `Invalid owner ${params.familyOwnerId}`,
    );
  }

  return await db
    .delete(familyWaitListTable)
    .where(
      and(
        eq(familyWaitListTable.familyId, family.id),
        eq(familyWaitListTable.userId, params.waitListMemberId),
      ),
    )
    .returning({ familyId: familyWaitListTable.familyId })
    .get();
}
