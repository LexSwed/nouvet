import { eq } from 'drizzle-orm';
import { type DatabaseUser } from 'lucia';

import { useDb } from '~/server/db';
import { petTable } from '~/server/db/schema';

export async function dbGetUserPets(userId: DatabaseUser['id']) {
  const db = useDb();
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
    .where(eq(petTable.ownerId, userId))
    .all();
}
