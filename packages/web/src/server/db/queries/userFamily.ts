'use server';

import { eq, sql } from 'drizzle-orm';

import { useDb } from '~/server/db';
import {
  familyTable,
  familyUserTable,
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
    .innerJoin(userTable, eq(userTable.id, userTable.id))
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
        isOwner: sql<number>`(${familyTable.ownerId} = ${userId})`.as(
          'is_owner',
        ),
        isApproved: familyUserTable.approved,
      },
    })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .innerJoin(userTable, eq(userTable.id, userTable.id))
    .leftJoin(familyUserTable, eq(familyUserTable.userId, userId))
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
