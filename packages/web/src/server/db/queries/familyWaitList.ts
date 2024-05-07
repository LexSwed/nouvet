'use server';

import { and, eq } from 'drizzle-orm';

import { useDb } from '~/server/db';
import {
  familyTable,
  familyUserTable,
  familyWaitListTable,
  userTable,
  type DatabaseUser,
} from '~/server/db/schema';

export async function familyWaitList(userId: DatabaseUser['id']) {
  const db = useDb();

  const family = db
    .select({ familyId: familyUserTable.familyId })
    .from(familyUserTable)
    .where(
      and(eq(familyUserTable.userId, userId), eq(familyTable.ownerId, userId)),
    )
    .innerJoin(familyTable, eq(familyTable.id, familyUserTable.familyId))
    .get();

  if (!family?.familyId) {
    return null;
  }

  const users = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      avatarUrl: userTable.avatarUrl,
      joinedAt: familyWaitListTable.joinedAt,
    })
    .from(familyWaitListTable)
    .where(eq(familyWaitListTable.familyId, family.familyId))
    .innerJoin(userTable, eq(familyWaitListTable.userId, userTable.id))
    .leftJoin(familyTable, eq(familyTable.id, familyWaitListTable.familyId))
    .all();

  return users;
}
