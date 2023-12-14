import { cache } from '@solidjs/router';
import { getDbUserFamilyAndPets } from '../db/queries/getUserFamilyAndPets';
import { getCurrentUser } from './utils';

export const getUserFamilyAndPets = cache(async () => {
  'use server';
  const currentUser = getCurrentUser();
  const familyPets = await getDbUserFamilyAndPets(currentUser.id);

  if (familyPets.length === 0) throw new Error('User is not authenticated');

  const user = {
    userId: familyPets[0].userId,
    family: familyPets[0].familyId
      ? {
          id: familyPets[0].familyId,
          name: familyPets[0].familyName,
        }
      : null,
    pets: familyPets.reduce(
      (res, pet) => {
        if (pet.petId !== null && pet.petName !== null) {
          res.push({ id: pet.petId, name: pet.petName });
        }
        return res;
      },
      [] as Array<{ id: number; name: string }>,
    ),
  };

  return user;
}, 'user-family-pets');
