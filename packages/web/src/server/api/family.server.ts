'use server';

import { getRequestUser } from '../auth/request-user';
import { familyMembers as dbFamilyMembers } from '../db/queries/family';

export const familyMembers = async () => {
  try {
    const user = await getRequestUser();

    const members = await dbFamilyMembers(user.userId);

    return members;
  } catch (error) {
    console.error(error);
  }
};
