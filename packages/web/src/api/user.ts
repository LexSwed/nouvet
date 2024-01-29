'use server';

import { cache } from '@solidjs/router';

import { getRequestUserSafe } from '~/server/auth/session-safe';
import { userFamily } from '../server/queries/userFamily';

export const getUserFamily = cache(userFamily, 'user-family');

export const getUserMeasurementSystem = cache(async () => {
  const user = await getRequestUserSafe();
  return user.measurementSystem;
}, 'user-measurement-system');
