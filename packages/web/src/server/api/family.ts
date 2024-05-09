import { action, cache } from '@solidjs/router';
import { differenceInMinutes } from 'date-fns/differenceInMinutes';

import { timeout } from '../utils';

import {
  cancelFamilyJoinServer,
  deleteFamilyServer,
  getFamilyMembersServer,
  getWaitListMembersServer,
  updateFamilyServer,
} from './family.server';

export const getFamilyMembers = cache(
  async () => getFamilyMembersServer(),
  'family-members',
);

export const getWaitListMembers = cache(async () => {
  await timeout(5000);
  return getWaitListMembersServer();
}, 'wait-list-members');

export const getRecentMember = cache(async () => {
  'use server';
  try {
    const waitList = await getWaitListMembers();
    if (waitList.length > 0)
      return {
        ...waitList[0],
        isApproved: false,
      };

    const members = await getFamilyMembers();

    const recentMember = members.find(
      (user) => differenceInMinutes(new Date(), user.joinedAt!) < 60,
    );

    if (!recentMember) return null;

    return {
      ...recentMember,
      isApproved: true,
    };
  } catch (error) {
    console.error(error);

    throw error;
  }
}, 'family-recent-members');

export const updateFamily = action((formData: FormData) =>
  updateFamilyServer(formData),
);

export const deleteFamily = action(() => deleteFamilyServer());

export const cancelFamilyJoin = action(() => cancelFamilyJoinServer());
