'use server';

import { eq, or, sql } from 'drizzle-orm';

import { useDb } from '~/server/db';
import {
  familyTable,
  familyUserTable,
  familyWaitListTable,
  userTable,
  type DatabaseUser,
} from '~/server/db/schema';

export async function userProfile(userId: DatabaseUser['id']) {
  const db = useDb();
  const userProfile = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      avatarUrl: userTable.avatarUrl,
    })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .get();

  return userProfile;
}

export async function userFamily(userId: DatabaseUser['id']) {
  const db = useDb();

  const userFamily = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      avatarUrl: userTable.avatarUrl,
      family: {
        id: familyTable.id,
        name: familyTable.name,
        isOwner: sql<number>`(${familyTable.ownerId} = ${userId})`,
        isInWaitList: sql<number>`(${familyWaitListTable.userId} = ${userId})`,
      },
    })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .leftJoin(familyUserTable, eq(familyUserTable.userId, userId))
    .leftJoin(familyWaitListTable, eq(familyWaitListTable.userId, userId))
    .leftJoin(
      familyTable,
      or(
        eq(familyTable.id, familyUserTable.familyId),
        eq(familyTable.id, familyWaitListTable.familyId),
      ),
    )
    .get();

  if (!userFamily) return null;

  return {
    ...userFamily,
    family: userFamily.family
      ? {
          ...userFamily.family,
          isOwner: userFamily.family.isOwner === 1,
          isApproved: !(userFamily.family.isInWaitList === 1),
        }
      : userFamily.family,
  };
}
