'use server';

import { and, eq, not, sql } from 'drizzle-orm';

import { useDb } from '~/server/db';
import {
  familyTable,
  familyUserTable,
  userProfileTable,
  userTable,
  type DatabaseUser,
} from '~/server/db/schema';

/**
 * If user is the owner of the family - lists all family members.
 * If user is not the owner - lists only approved members.
 * If user is not approved - lists only itself.
 */
export async function familyMembers(userId: DatabaseUser['id']) {
  const db = useDb();
  const family = await db
    .select({
      id: familyUserTable.familyId,
      isOwner: sql<number>`(${familyTable.ownerId} = ${userId})`.as('is_owner'),
    })
    .from(familyUserTable)
    .where(
      and(
        eq(familyUserTable.userId, userId),
        eq(familyUserTable.approved, true),
      ),
    )
    .leftJoin(familyTable, eq(familyTable.id, familyUserTable.familyId))
    .orderBy(familyUserTable.joinedAt)
    .get();

  if (!family) return null;

  const query = db
    .select({
      id: userTable.id,
      name: userProfileTable.name,
      avatarUrl: userProfileTable.avatarUrl,
      isApproved: familyUserTable.approved,
      joinedAt: familyUserTable.joinedAt,
    })
    .from(userTable)
    .where(
      and(
        eq(familyUserTable.familyId, family.id),
        // not current user
        not(eq(familyUserTable.userId, userId)),
        // if not the owner, only return approved users
        family.isOwner === 0 ? eq(familyUserTable.approved, true) : undefined,
      ),
    )
    .innerJoin(userProfileTable, eq(userTable.id, userProfileTable.userId))
    .innerJoin(familyUserTable, eq(familyUserTable.userId, userTable.id))
    .orderBy(familyUserTable.joinedAt);

  const users = await query.all();
  return users;
}

export async function acceptUserToFamily(params: {
  familyOwnerId: DatabaseUser['id'];
  inviteeId: DatabaseUser['id'];
}) {
  const db = useDb();

  return await db.transaction((tx) => {
    const family = tx
      .select({ id: familyTable.id })
      .from(familyTable)
      .where(eq(familyTable.ownerId, params.familyOwnerId))
      .get();
    if (!family?.id) throw new Error(`Invalid owner ${params.familyOwnerId}`);
    return tx
      .update(familyUserTable)
      .set({ approved: true })
      .where(
        and(
          eq(familyUserTable.familyId, family.id),
          eq(familyUserTable.userId, params.inviteeId),
        ),
      )
      .returning({
        userId: familyUserTable.userId,
        familyId: familyUserTable.familyId,
        approved: familyUserTable.approved,
      });
  });
}

export async function revokeUserInvite(params: {
  familyOwnerId: DatabaseUser['id'];
  inviteeId: DatabaseUser['id'];
}) {
  const db = useDb();

  return await db.transaction(async (tx) => {
    const family = tx
      .select({ id: familyTable.id })
      .from(familyTable)
      .where(eq(familyTable.ownerId, params.familyOwnerId))
      .get();
    if (!family?.id) throw new Error(`Invalid owner ${params.familyOwnerId}`);

    return await tx
      .delete(familyUserTable)
      .where(
        and(
          eq(familyUserTable.familyId, family.id),
          eq(familyUserTable.userId, params.inviteeId),
        ),
      )
      .returning({ familyId: familyUserTable.familyId });
  });
}
