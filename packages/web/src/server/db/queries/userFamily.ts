'use server';

import { eq } from 'drizzle-orm';

import { useDb } from '~/server/db';
import {
  familyTable,
  familyUserTable,
  userProfileTable,
  userTable,
  type DatabaseUser,
} from '~/server/db/schema';

export async function userProfile(userId: DatabaseUser['id']) {
  const db = useDb();
  const userProfile = await db
    .select({
      id: userProfileTable.userId,
      name: userProfileTable.name,
      avatarUrl: userProfileTable.avatarUrl,
    })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .innerJoin(userProfileTable, eq(userTable.id, userProfileTable.userId))
    .get();

  return userProfile;
}

export async function userFamily(userId: DatabaseUser['id']) {
  const db = useDb();
  const family = db
    .select({
      id: familyUserTable.familyId,
    })
    .from(familyUserTable)
    .where(eq(familyUserTable.userId, userId));

  return db
    .select({
      id: userTable.id,
      name: userProfileTable.name,
      avatarUrl: userProfileTable.avatarUrl,
      family: {
        id: familyTable.id,
        name: familyTable.name,
        ownerId: familyTable.creatorId,
        approved: familyUserTable.approved,
      },
    })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .innerJoin(userProfileTable, eq(userTable.id, userProfileTable.userId))
    .innerJoin(familyUserTable, eq(familyUserTable.userId, userId))
    .leftJoin(familyTable, eq(familyTable.id, family))
    .get();
}
