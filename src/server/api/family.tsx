import { cache } from '@solidjs/router';
import { getRequestEvent } from 'solid-js/web';
import { getDbUserFamilyAndPets } from '../db/queries/family';

export const getUserFamilyAndPets = cache(async () => {
  'use server';
  const id = getCurrentUser();
  const familyPets = await getDbUserFamilyAndPets(id);

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

  // TODO: group by user
}, 'user-family-pets');

function getCurrentUser() {
  const event = getRequestEvent();

  if (
    typeof event?.locals.user === 'object' &&
    event?.locals.user !== null &&
    'id' in event.locals.user
  ) {
    return event.locals.user.id as string;
  }
  throw new Error('User is not authenticated');
}
