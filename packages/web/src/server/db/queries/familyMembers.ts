'use server';

import { and, eq, not } from 'drizzle-orm';

import { useDb } from '~/server/db';
import {
  familyUserTable,
  familyWaitListTable,
  userTable,
  type DatabaseUser,
} from '~/server/db/schema';

/**
 * Lists all family members and any new user in the wait list.
 */
export async function familyMembers(userId: DatabaseUser['id']) {
  const db = useDb();

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
        // in the same family as current user
        eq(
          familyUserTable.familyId,
          db
            .select({ familyId: familyUserTable.familyId })
            .from(familyUserTable)
            .where(eq(familyUserTable.userId, userId)),
        ),
        // not current user
        not(eq(familyUserTable.userId, userId)),
      ),
    )
    .leftJoin(
      familyWaitListTable,
      eq(familyWaitListTable.familyId, familyUserTable.familyId),
    )
    .innerJoin(userTable, eq(familyUserTable.userId, userTable.id))
    .orderBy(familyUserTable.joinedAt)
    .all();

  return users;
}

/**
 * Gets a family member either from the waitlist,
 * or the one who joined the family in the last ~1 hour.
 */
export async function recentFamilyMember(userId: DatabaseUser['id']) {
  const db = useDb();

  const waitListUser = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      avatarUrl: userTable.avatarUrl,
      joinedAt: familyUserTable.joinedAt,
    })
    .from(userTable)
    .where(
      eq(
        familyWaitListTable.familyId,
        db
          .select({ familyId: familyUserTable.familyId })
          .from(familyUserTable)
          .where(eq(familyUserTable.userId, userId)),
      ),
    )
    .leftJoin(
      familyWaitListTable,
      eq(familyWaitListTable.familyId, familyUserTable.familyId),
    )
    .orderBy(familyWaitListTable.userId)
    .get();

  if (waitListUser) {
    return waitListUser;
  }

  const user = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      avatarUrl: userTable.avatarUrl,
      joinedAt: familyUserTable.joinedAt,
    })
    .from(userTable)
    .where(
      and(
        // in the same family as current user
        eq(
          familyUserTable.familyId,
          db
            .select({ familyId: familyUserTable.familyId })
            .from(familyUserTable)
            .where(eq(familyUserTable.userId, userId)),
        ),
        // not current user
        not(eq(familyUserTable.userId, userId)),
      ),
    )
    .innerJoin(familyUserTable, eq(familyUserTable.userId, userTable.id))
    .orderBy(familyUserTable.joinedAt)
    .get();

  return user;
}
