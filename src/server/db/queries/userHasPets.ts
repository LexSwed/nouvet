import { eq } from 'drizzle-orm';
import { useDb } from '..';
import { petTable, type DatabaseUser } from '../schema';

/**
 * New users don't have a family nor pets.
 * Some users can be invited to a family that has a pet, but users are not owning them.
 * Users can be removed from families, but still own a pet.
 */
export const userHasPets = async (userId: DatabaseUser['id']) => {
  const db = useDb();
  return db
    .select({ petId: petTable.id })
    .from(petTable)
    .where(eq(petTable.ownerId, userId))
    .get();
};
