'use server';

import { and, count, eq, sql } from 'drizzle-orm';

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

  const userFamily = await db
    .select({
      id: userTable.id,
      name: userProfileTable.name,
      avatarUrl: userProfileTable.avatarUrl,
      family: {
        id: familyTable.id,
        name: familyTable.name,
        isOwner: sql<number>`(${familyTable.ownerId} = ${userId})`.as(
          'is_owner',
        ),
        isApproved: familyUserTable.approved,
        waitingApproval: count(
          db
            .select({ id: familyUserTable.userId })
            .from(familyUserTable)
            .where(
              and(
                eq(familyUserTable.familyId, familyTable.id),
                eq(familyUserTable.approved, false),
              ),
            ),
        ),
      },
    })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .innerJoin(userProfileTable, eq(userTable.id, userProfileTable.userId))
    .innerJoin(familyUserTable, eq(familyUserTable.userId, userId))
    .leftJoin(familyTable, eq(familyTable.id, familyUserTable.familyId))
    .get();

  if (!userFamily) return null;

  return {
    ...userFamily,
    family: userFamily.family
      ? {
          ...userFamily.family,
          isOwner: userFamily.family.isOwner === 1,
        }
      : userFamily.family,
  };
}
