'use server';

import { and, eq, sql } from 'drizzle-orm';

import { useDb } from '~/server/db';
import {
  familyTable,
  familyUserTable,
  userProfileTable,
  userTable,
  type DatabaseFamily,
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

export async function familyUsersNotApproved(familyId: DatabaseFamily['id']) {
  const db = useDb();
  return db
    .select({
      userId: userTable.id,
      name: userProfileTable.name,
      avatarUrl: userProfileTable.avatarUrl,
    })
    .from(userTable)
    .where(
      eq(
        userTable.id,
        db
          .select({ userId: familyUserTable.userId })
          .from(familyUserTable)
          .where(
            and(
              eq(familyUserTable.familyId, familyId),
              eq(familyUserTable.approved, false),
            ),
          ),
      ),
    )
    .innerJoin(userProfileTable, eq(userTable.id, userProfileTable.userId));
}

export async function userFamily(userId: DatabaseUser['id']) {
  const db = useDb();
  const family = db
    .select({
      id: familyUserTable.familyId,
    })
    .from(familyUserTable)
    .where(eq(familyUserTable.userId, userId));

  const userFamily = await db
    .select({
      id: userTable.id,
      name: userProfileTable.name,
      avatarUrl: userProfileTable.avatarUrl,
      family: {
        id: familyTable.id,
        name: familyTable.name,
        isOwner: sql<number>`(${familyTable.creatorId} == ${userId})`.as(
          'is_owner',
        ),
        isApproved: familyUserTable.approved,
      },
    })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .innerJoin(userProfileTable, eq(userTable.id, userProfileTable.userId))
    .innerJoin(familyUserTable, eq(familyUserTable.userId, userId))
    .leftJoin(familyTable, eq(familyTable.id, family))
    .get();

  return {
    ...userFamily,
    family: {
      ...userFamily?.family,
      isOwner: userFamily?.family.isOwner === 1,
    },
  };
}
