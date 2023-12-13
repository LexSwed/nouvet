import { cache } from '@solidjs/router';
import { type User } from 'lucia';
import { getRequestEvent } from 'solid-js/web';
import {
  getDbUserFamilyAndPets,
  getUserHasAFamilyPet,
  getUserPets,
  userHasPets,
} from '../db/queries/family';

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

  // TODO: group by user
}, 'user-family-pets');

/**
 * Check if a user has no pets or not a part of a family.
 * If user just registered all removed the data.
 *
 */
export const getIsEmptyUser = cache(async () => {
  'use server';
  const currentUser = getCurrentUser();
  if (currentUser.familyId) return false;
  const pets = await userHasPets(currentUser.id);
  return pets?.petId ? false : true;
}, 'is-new-user');

function getCurrentUser() {
  const event = getRequestEvent();

  if (
    typeof event?.locals.user === 'object' &&
    event?.locals.user !== null &&
    'id' in event.locals.user
  ) {
    return event.locals.user as User;
  }
  throw new Error('User is not authenticated');
}
