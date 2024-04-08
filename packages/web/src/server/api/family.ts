import { cache } from '@solidjs/router';

import { getRequestUser } from '~/server/auth/request-user';
import { familyMembers } from '~/server/db/queries/familyMembers';

export const getFamilyMembers = cache(async () => {
  'use server';
  try {
    const user = await getRequestUser();

    const members = await familyMembers(user.userId);

    return members;
  } catch (error) {
    console.error(error);
  }
}, 'family-members');
