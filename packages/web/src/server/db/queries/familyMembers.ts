'use server';

import { and, eq, lt, not, or, sql } from 'drizzle-orm';

import { useDb } from '~/server/db';
import {
  familyUserTable,
  familyWaitListTable,
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
    .where(eq(familyUserTable.userId, userId));

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
        eq(familyUserTable.familyId, family),
        not(eq(familyUserTable.userId, userId)),
      ),
    )
    .innerJoin(userTable, eq(familyUserTable.userId, userTable.id))
    .all();

  return users;
}

export async function recentFamilyMember(userId: DatabaseUser['id']) {
  const db = useDb();

  const family = db
    .select({ familyId: familyUserTable.familyId })
    .from(familyUserTable)
    .where(eq(familyUserTable.userId, userId));

  const user = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      avatarUrl: userTable.avatarUrl,
      isApproved: sql<number>`(${familyUserTable.userId} == ${userTable.id})`,
    })
    .from(userTable)
    .where(
      or(
        // recently joined user
        and(
          not(eq(familyUserTable.userId, userId)),
          eq(familyUserTable.familyId, family),
          lt(
            sql`(unixepoch(concat(datetime('now', 'utc'), 'Z')) - unixepoch(${familyUserTable.joinedAt})) / 60`,
            60,
          ),
        ),
        eq(familyWaitListTable.familyId, family),
      ),
    )
    .leftJoin(familyUserTable, eq(familyUserTable.userId, userTable.id))
    .leftJoin(familyWaitListTable, eq(familyWaitListTable.userId, userTable.id))
    .orderBy(familyWaitListTable.joinedAt, familyUserTable.joinedAt)
    .get();

  if (!user) return null;

  const { isApproved, ...u } = user;
  return {
    ...u,
    isApproved: isApproved === 1,
  };
}
