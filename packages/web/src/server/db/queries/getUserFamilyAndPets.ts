import { eq } from 'drizzle-orm';
import { type DatabaseUser } from 'lucia';

import { useDb } from '~/server/db';
import {
  familyTable,
  petTable,
  userProfileTable,
  userTable,
} from '~/server/db/schema';

export async function getDbUserFamilyAndPets(userId: DatabaseUser['id']) {
  const db = useDb();
  return db
    .select({
      userId: userTable.id,
      familyId: userTable.familyId,
      familyName: familyTable.name,
      petId: petTable.id,
      petName: petTable.name,
      petPicture: petTable.pictureUrl,
      avatarUrl: userProfileTable.avatarUrl,
      name: userProfileTable.name,
    })
    .from(userTable)
    .orderBy(userTable.id, petTable.id)
    .leftJoin(familyTable, eq(userTable.familyId, familyTable.id))
    .leftJoin(petTable, eq(petTable.ownerId, userTable.id))
    .leftJoin(userProfileTable, eq(userTable.id, userProfileTable.userId))
    .where(eq(userTable.id, userId))
    .groupBy(userTable.id)
    .all();
}
