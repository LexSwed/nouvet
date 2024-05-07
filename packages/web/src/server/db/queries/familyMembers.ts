'use server';

import { and, eq, not } from 'drizzle-orm';

import { useDb } from '~/server/db';
import {
  familyTable,
  familyUserTable,
  userTable,
  type DatabaseUser,
} from '~/server/db/schema';

/**
 * Lists all family members.
 * If request user is the owner of the family, also
 * includes users from the wait list.
 * Returns {null} if user is not part of a family
 */
export async function familyMembers(userId: DatabaseUser['id']) {
  const db = useDb();

  const family = db
    .select({ familyId: familyUserTable.familyId })
    .from(familyUserTable)
    .where(eq(familyUserTable.userId, userId))
    .get();

  if (!family?.familyId) {
    return null;
  }

  const users = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      avatarUrl: userTable.avatarUrl,
      joinedAt: familyUserTable.joinedAt,
    })
    .from(familyUserTable)
    .where(
      and(
        not(eq(familyUserTable.userId, userId)),
        eq(familyUserTable.familyId, family.familyId),
      ),
    )
    .innerJoin(userTable, eq(familyUserTable.userId, userTable.id))
    .leftJoin(familyTable, eq(familyTable.id, familyUserTable.familyId))
    .all();

  return users;
}
