import { action, revalidate } from '@solidjs/router';
import { getRequestEvent } from 'solid-js/web';

import { getRequestUser } from '~/server/auth/user-session';
import { dbCreatePet } from '~/server/db/queries/createPet';

import { getUserPets } from './user';

export const createPet = action(async (formData) => {
  const event = getRequestEvent();
  const currentUser = await getRequestUser(event!);
  try {
    const result = await dbCreatePet(
      {
        name: formData.get('name'),
        type: formData.get('type'),
        gender: formData.get('gender'),
      },
      currentUser.userId,
    );
    if (result.errors) {
      return { errors: result.errors };
    }
    revalidate(getUserPets.key);
    return result;
  } catch (error) {
    console.error(error);
    return { failed: true };
  }
}, 'createPet');
