'use server';

import { getRequestEvent } from 'solid-js/web';
import { eq } from 'drizzle-orm';

import { useDb } from '~/server/db';
import { familyTable, userProfileTable, userTable } from '~/server/db/schema';
import { getRequestUser } from '../auth/user-session';

export async function userFamily() {
  const event = getRequestEvent();
  const currentUser = await getRequestUser(event!);

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
    .where(eq(userTable.id, currentUser.userId))
    .leftJoin(userProfileTable, eq(userTable.id, userProfileTable.userId))
    .leftJoin(familyTable, eq(userTable.familyId, familyTable.id))
    .get();
}
