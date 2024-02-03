'use server';

import { eq } from 'drizzle-orm';

import { useDb } from '~/server/db';
import {
  familyTable,
  userProfileTable,
  userTable,
  type DatabaseUser,
} from '~/server/db/schema';

export async function userFamily(userId: DatabaseUser['id']) {
  const db = useDb();
  return db
    .select({
      id: userTable.id,
      name: userProfileTable.name,
      avatarUrl: userProfileTable.avatarUrl,
      family: {
        id: familyTable.id,
        name: familyTable.name,
      },
    })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .leftJoin(userProfileTable, eq(userTable.id, userProfileTable.userId))
    .leftJoin(familyTable, eq(userTable.familyId, familyTable.id))
    .get();
}
