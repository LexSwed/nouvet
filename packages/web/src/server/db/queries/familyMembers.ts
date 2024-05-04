'use server';

import { eq, not } from 'drizzle-orm';

import { useDb } from '~/server/db';
import {
  familyUserTable,
  userTable,
  type DatabaseUser,
} from '~/server/db/schema';

/**
 * Lists all family members.
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
    .from(userTable)
    .where(
      // not current user
      not(eq(familyUserTable.userId, userId)),
    )
    .innerJoin(familyUserTable, eq(familyUserTable.userId, userTable.id))
    .orderBy(familyUserTable.joinedAt)
    .all();

  return users;
}
