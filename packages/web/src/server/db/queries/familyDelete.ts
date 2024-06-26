'use server';

import { eq } from 'drizzle-orm';

import { useDb } from '~/server/db';
import {
  familyInviteTable,
  familyTable,
  type UserID,
} from '~/server/db/schema';

export async function familyDelete(userId: UserID) {
  const db = useDb();
  const family = await db
    .delete(familyTable)
    .where(eq(familyTable.ownerId, userId))
    .returning({ id: familyTable.id })
    .get();
  await db
    .delete(familyInviteTable)
    .where(eq(familyInviteTable.inviterId, userId));
  return family;
}
