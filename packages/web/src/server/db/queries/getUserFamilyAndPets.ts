import { eq } from 'drizzle-orm';
import { type DatabaseUser } from 'lucia';

import { useDb } from '~/server/db';
import {
  familyTable,
  petTable,
  userProfileTable,
  userTable,
} from '~/server/db/schema';

export const getDbUserFamilyAndPets = async (userId: DatabaseUser['id']) => {
  const db = useDb();
  return db
    .select({
      userId: userTable.id,
      familyId: userTable.familyId,
      familyName: familyTable.name,
      petId: petTable.id,
      petName: petTable.name,
      avatarUrl: userProfileTable.avatarUrl,
      name: userProfileTable.name,
    })
    .from(userTable)
    .leftJoin(familyTable, eq(userTable.familyId, familyTable.id))
    .leftJoin(petTable, eq(petTable.ownerId, userTable.id))
    .leftJoin(userProfileTable, eq(userTable.id, userProfileTable.userId))
    .where(eq(userTable.id, userId))
    .groupBy(userTable.id)
    .all();
};
