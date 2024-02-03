import { cache } from '@solidjs/router';

import { getRequestUser } from '~/server/queries/getUserSession';
import { userFamily } from '~/server/queries/userFamily';

export const getUserFamily = cache(async () => {
  'use server';
  const currentUser = await getRequestUser();
  return userFamily(currentUser.userId);
}, 'user-family');

export const getUserMeasurementSystem = cache(async () => {
  'use server';
  const user = await getRequestUser();
  return user.measurementSystem;
}, 'user-measurement-system');
