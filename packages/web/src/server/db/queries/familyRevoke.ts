'use server';

import { and, eq } from 'drizzle-orm';

import {
  familyTable,
  familyUserTable,
  type DatabaseUser,
} from '~/server/db/schema';
import { NotAllowedToPerformFamilyAction } from '~/server/errors';

import { useDb } from '..';

export async function revokeUserMembership(params: {
  familyOwnerId: DatabaseUser['id'];
  familyMemberId: DatabaseUser['id'];
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
    .delete(familyUserTable)
    .where(
      and(
        eq(familyUserTable.familyId, family.id),
        eq(familyUserTable.userId, params.familyMemberId),
      ),
    )
    .returning({ familyId: familyUserTable.familyId })
    .get();
}
