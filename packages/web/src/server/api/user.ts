import { cache } from '@solidjs/router';

import { getRequestUser } from '~/server/db/queries/getUserSession';
import { userFamily } from '~/server/db/queries/userFamily';

export const getUserFamily = cache(async () => {
  'use server';
  const currentUser = await getRequestUser();
  return userFamily(currentUser.userId);
}, 'user-family');

export const getUser = cache(async () => {
  'use server';
  const user = await getRequestUser();
  return user;
}, 'user');
