import { cache } from '@solidjs/router';
import { userHasPets } from '../db/queries/userHasPets';
import { getCurrentUser } from './utils';

/**
 * Check if a user has no pets or not a part of a family.
 * If user just registered all removed the data.
 */
export const getIsEmptyUser = cache(async () => {
  'use server';
  const currentUser = getCurrentUser();
  if (currentUser.familyId) return false;
  try {
    const pets = await userHasPets(currentUser.id);

    console.log(pets);
    return pets?.petId ? false : true;
  } catch (error) {
    console.error(error);
    return true;
  }
}, 'is-new-user');
