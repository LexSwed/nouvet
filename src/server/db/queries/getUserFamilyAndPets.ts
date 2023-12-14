import { eq } from 'drizzle-orm';
import type { DatabaseUser } from 'lucia';
import { useDb } from '..';
import { userTable, familyTable, petTable } from '../schema';

export const getDbUserFamilyAndPets = async (userId: DatabaseUser['id']) => {
  const db = useDb();
  return await db
    .select({
      userId: userTable.id,
      familyId: userTable.familyId,
      familyName: familyTable.name,
      petId: petTable.id,
      petName: petTable.name,
    })
    .from(userTable)
    .leftJoin(familyTable, eq(userTable.familyId, familyTable.id))
    .leftJoin(petTable, eq(petTable.ownerId, userTable.id))
    .where(eq(userTable.id, userId))
    .all();
};
