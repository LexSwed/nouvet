'use server';

import { cache } from '@solidjs/router';
import { getRequestEvent } from 'solid-js/web';

import { getRequestUser } from '../server/auth/user-session';
import { dbGetUserFamily } from '../server/db/queries/getUserFamily';
import { dbGetUserPets } from '../server/db/queries/getUserPets';

export const getUserFamily = cache(async () => {
  const event = getRequestEvent();
  const currentUser = await getRequestUser(event!);
  const user = await dbGetUserFamily(currentUser.userId);

  return user;
}, 'user-family');

export const getUserPets = cache(async () => {
  const event = getRequestEvent();
  const currentUser = await getRequestUser(event!);
  const pets = await dbGetUserPets(currentUser.userId);

  return pets;
}, 'user-pets');
