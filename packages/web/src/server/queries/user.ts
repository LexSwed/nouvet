import { action, cache, revalidate } from '@solidjs/router';
import { getRequestEvent } from 'solid-js/web';

import { dbCreatePet } from '~/server/db/queries/createPet';
import { dbGetUserFamily } from '~/server/db/queries/getUserFamilyAndPets';
import { getRequestUser } from '../auth/user-session';
import { dbGetUserPets } from '../db/queries/getUserPets';

export const getUserFamily = cache(async () => {
  'use server';
  const event = getRequestEvent();
  const currentUser = await getRequestUser(event!);
  const user = await dbGetUserFamily(currentUser.userId);

  return user;
}, 'user-family');

export const getUserPets = cache(async () => {
  'use server';
  const event = getRequestEvent();
  const currentUser = await getRequestUser(event!);
  const pets = await dbGetUserPets(currentUser.userId);

  return pets;
}, 'user-pets');

export const createPet = action(async (formData) => {
  'use server';
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
