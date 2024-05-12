'use server';

import { and, eq, not, or, sql } from 'drizzle-orm';

import { useDb } from '~/server/db';
import {
  familyTable,
  familyUserTable,
  familyWaitListTable,
  userTable,
  type DatabaseUser,
} from '~/server/db/schema';

/**
 * Lists all family members.
 * If request user is the owner of the family, also
 * includes users from the wait list.
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
      isApproved: sql<number>`(${familyUserTable.userId} == ${userTable.id})`,
      joinedAt: sql<string>`iif(${familyUserTable.userId} == ${userTable.id}, ${familyUserTable.joinedAt}, ${familyWaitListTable.joinedAt})`,
    })
    .from(userTable)
    .where(
      or(
        // recently joined user
        and(
          not(eq(familyUserTable.userId, userId)),
          eq(familyUserTable.familyId, family),
          // lt(
          //   sql`(unixepoch(concat(datetime('now', 'utc'), 'Z')) - unixepoch(${familyUserTable.joinedAt})) / 60`,
          //   60,
          // ),
        ),
        and(
          eq(familyTable.ownerId, userId),
          eq(familyWaitListTable.familyId, family),
        ),
      ),
    )
    .leftJoin(familyUserTable, eq(familyUserTable.userId, userTable.id))
    .leftJoin(familyWaitListTable, eq(familyWaitListTable.userId, userTable.id))
    .leftJoin(familyTable, eq(familyTable.id, family))
    .orderBy(familyWaitListTable.joinedAt, familyUserTable.joinedAt)
    .all();

  if (!users) return [];

  return users.map((user) => ({ ...user, isApproved: user.isApproved === 1 }));
}
