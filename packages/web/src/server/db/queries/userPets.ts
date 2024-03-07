'use server';

import { eq, inArray, or } from 'drizzle-orm';

import { useDb } from '~/server/db';
import {
  familyUserTable,
  petTable,
  type DatabaseUser,
} from '~/server/db/schema';

export async function userPets(userId: DatabaseUser['id']) {
  const db = useDb();
  const familyUsers = db
    .select({ userId: familyUserTable.userId })
    .from(familyUserTable)
    .where(
      eq(
        familyUserTable.familyId,
        db
          .select({ familyId: familyUserTable.familyId })
          .from(familyUserTable)
          .where(eq(familyUserTable.userId, userId)),
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
      ownerId: petTable.ownerId,
    })
    .from(petTable)
    .where(
      or(eq(petTable.ownerId, userId), inArray(petTable.ownerId, familyUsers)),
    )
    .orderBy(petTable.createdAt)
    .all();
}
