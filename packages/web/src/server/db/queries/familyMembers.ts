'use server';

import { and, eq, sql } from 'drizzle-orm';

import { useDb } from '~/server/db';
import {
  familyTable,
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
      isApproved: sql<number>`(${familyWaitListTable.userId} = ${userId})`,
    })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .leftJoin(familyUserTable, eq(familyUserTable.userId, userId))
    .leftJoin(familyTable, eq(familyTable.id, familyUserTable.familyId))
    .leftJoin(
      familyWaitListTable,
      and(
        eq(familyTable.ownerId, userId),
        eq(familyWaitListTable.userId, userId),
      ),
    )
    .orderBy(familyUserTable.joinedAt)
    .all();

  return users.map((user) => ({ ...user, isApproved: user.isApproved === 1 }));
}
