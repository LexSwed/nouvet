import { cache } from '@solidjs/router';
import { getRequestEvent } from 'solid-js/web';

import { getRequestUser } from '~/server/auth/user-session';
import { getDbUserFamilyAndPets } from '~/server/db/queries/getUserFamilyAndPets';

export const getUserFamilyAndPets = cache(async () => {
  'use server';
  const event = getRequestEvent();
  const currentUser = await getRequestUser(event!);
  const userData = await getDbUserFamilyAndPets(currentUser.userId);

  if (userData.length === 0) throw new Error('User is not authenticated');
  const { userId, avatarUrl, name, familyId, familyName } = userData[0];

  const user = {
    id: userId,
    name,
    avatarUrl,
    family: familyId
      ? {
          id: familyId,
          name: familyName,
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
