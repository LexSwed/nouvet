import { eq, inArray, or } from 'drizzle-orm';
import { type DatabaseUser } from 'lucia';

import { useDb } from '~/server/db';
import { petTable, userTable } from '~/server/db/schema';

export async function dbGetUserPets(userId: DatabaseUser['id']) {
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
    })
    .from(petTable)
    .where(inArray(petTable.ownerId, familyUsers))
    .all();
}
