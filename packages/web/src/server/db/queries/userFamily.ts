'use server';

import { and, eq, inArray, or } from 'drizzle-orm';

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
    .where(
      or(
        eq(
          familyUserTable.familyId,
          db
            .select({ familyId: familyTable.id })
            .from(familyTable)
            .where(eq(familyTable.creatorId, userId)),
        ),
        and(
          eq(familyUserTable.userId, userId),
          eq(familyUserTable.approved, true),
        ),
      ),
    );

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
    .innerJoin(userProfileTable, eq(userTable.id, userProfileTable.userId))
    .leftJoin(familyTable, inArray(familyTable.id, family))
    .get();
}
