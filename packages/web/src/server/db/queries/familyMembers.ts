'use server';

import { and, eq, sql } from 'drizzle-orm';

import { useDb } from '~/server/db';
import {
  familyTable,
  familyUserTable,
  userProfileTable,
  userTable,
  type DatabaseUser,
} from '~/server/db/schema';

export async function familyMembers(userId: DatabaseUser['id']) {
  const db = useDb();
  const family = await db
    .select({
      id: familyUserTable.familyId,
      isOwner: sql<number>`(${familyTable.ownerId} = ${userId})`.as('is_owner'),
    })
    .from(familyUserTable)
    .leftJoin(
      familyTable,
      and(
        eq(familyUserTable.userId, userId),
        eq(familyTable.id, familyUserTable.familyId),
      ),
    )
    .get();

  if (!family) return null;

  const query = db
    .select({
      id: userTable.id,
      name: userProfileTable.name,
      avatarUrl: userProfileTable.avatarUrl,
      isApproved: familyUserTable.approved,
    })
    .from(userTable)
    .innerJoin(userProfileTable, eq(userTable.id, userProfileTable.userId));

  if (family.isOwner === 1) {
    query.innerJoin(familyUserTable, eq(familyUserTable.userId, userTable.id));
  }

  const users = await query.all();
  return users;
}

export function acceptUserToFamily(params: {
  familyOwnerId: DatabaseUser['id'];
  inviteeId: DatabaseUser['id'];
}) {}
export function revokeUserInvite(params: {
  familyOwnerId: DatabaseUser['id'];
  inviteeId: DatabaseUser['id'];
}) {}
