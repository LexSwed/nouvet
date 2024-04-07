'use server';

import { getRequestUser } from '../auth/request-user';
import { familyMembers as dbFamilyMembers } from '../db/queries/family';

export const familyMembers = async () => {
  try {
    const user = await getRequestUser();

    const members = await dbFamilyMembers(user.userId);

    // no family created yet
    if (!members) return null;

    return Object.groupBy(members, (user) =>
      user.isApproved ? 'approved' : 'waiting',
    );
  } catch (error) {
    console.error(error);
  }
};
