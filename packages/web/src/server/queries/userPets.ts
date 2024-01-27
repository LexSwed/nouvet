'use server';

import { getRequestEvent } from 'solid-js/web';
import { eq, inArray, or } from 'drizzle-orm';

import { useDb } from '~/server/db';
import { petTable, userTable } from '~/server/db/schema';
import { getRequestUser } from '../auth/user-session';

export async function userPets() {
  const event = getRequestEvent();
  const currentUser = await getRequestUser(event!);

  const db = useDb();
  const familyUsers = db
    .selectDistinct({ ownerId: userTable.id })
    .from(userTable)
    .where(
      or(
        eq(userTable.id, currentUser.userId),
        inArray(
          userTable.familyId,
          db
            .select({ familyId: userTable.familyId })
            .from(userTable)
            .where(eq(userTable.id, currentUser.userId)),
        ),
      ),
    );

  return db
    .select({
      id: petTable.id,
      name: petTable.name,
      pictureUrl: petTable.pictureUrl,
      type: petTable.type,
      breed: petTable.breed,
      gender: petTable.gender,
      dateOfBirth: petTable.dateOfBirth,
      color: petTable.color,
    })
    .from(petTable)
    .where(inArray(petTable.ownerId, familyUsers))
    .all();
}
