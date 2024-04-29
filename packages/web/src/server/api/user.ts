import { cache } from '@solidjs/router';

import { getRequestUser } from '~/server/auth/request-user';
import { userFamily, userProfile } from '~/server/db/queries/userFamily';

export const getUserFamily = cache(async () => {
  'use server';
  const currentUser = await getRequestUser();
  const user = await userFamily(currentUser.userId);
  if (!user) {
    console.error(`${currentUser.userId} was not resolved from the database`);
    throw Error('Something went wrong');
  }
  return user;
}, 'user-family');

export const getUser = cache(async () => {
  'use server';
  const user = await getRequestUser();
  return user;
}, 'user');

export const getUserProfile = cache(async () => {
  'use server';
  const user = await getRequestUser();
  return userProfile(user.userId);
}, 'user-profile');
