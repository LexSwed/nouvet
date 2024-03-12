import { cache } from '@solidjs/router';

import { getRequestUser } from '~/server/db/queries/getUserSession';
import {
  familyUsersNotApproved,
  userFamily,
  userProfile,
} from '~/server/db/queries/userFamily';

export const getUserFamily = cache(async () => {
  'use server';
  const currentUser = await getRequestUser();
  const user = await userFamily(currentUser.userId);
  if (user?.family.id && user.family.isOwner) {
    const usersAwaitingApproval = await familyUsersNotApproved(user.family.id);
    return { ...user, pendingUsers: usersAwaitingApproval };
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
