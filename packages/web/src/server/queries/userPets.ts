'use server';

import { eq, inArray, or } from 'drizzle-orm';

import { useDb } from '~/server/db';
import { petTable, userTable, type DatabaseUser } from '~/server/db/schema';

export async function userPets(userId: DatabaseUser['id']) {
  const db = useDb();
  const familyUsers = db
    .selectDistinct({ ownerId: userTable.id })
    .from(userTable)
    .where(
      or(
        eq(userTable.id, userId),
        inArray(
          userTable.familyId,
          db
            .select({ familyId: userTable.familyId })
            .from(userTable)
            .where(eq(userTable.id, userId)),
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
      weight: petTable.weight,
    })
    .from(petTable)
    .where(inArray(petTable.ownerId, familyUsers))
    .orderBy(petTable.createdAt)
    .all();
}
