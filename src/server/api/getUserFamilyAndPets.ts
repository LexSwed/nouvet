import { cache } from '@solidjs/router';
import { getDbUserFamilyAndPets } from '../db/queries/getUserFamilyAndPets';
import { getCurrentUser } from './utils';

export const getUserFamilyAndPets = cache(async () => {
  'use server';
  const currentUser = getCurrentUser();
  const userData = await getDbUserFamilyAndPets(currentUser.id);

  if (userData.length === 0) throw new Error('User is not authenticated');

  const user = {
    id: userData[0].userId,
    avatarUrl: userData[0].avatarUrl,
    name: userData[0].name,
    family: userData[0].familyId
      ? {
          id: userData[0].familyId,
          name: userData[0].familyName,
        }
      : null,
    pets: userData.reduce(
      (res, pet) => {
        if (pet.petId !== null && pet.petName !== null) {
          res.push({ id: pet.petId, name: pet.petName });
        }
        return res;
      },
      [] as Array<{ id: number; name: string }>,
    ),
  } as const;

  return user;
}, 'user-family-pets');
