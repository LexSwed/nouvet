import { action, cache } from '@solidjs/router';

import {
  cancelFamilyJoinServer,
  deleteFamilyServer,
  getFamilyMembersServer,
  getRecentMemberServer,
  getWaitListMembersServer,
  updateFamilyServer,
} from './family.server';

export const getFamilyMembers = cache(
  async () => getFamilyMembersServer(),
  'family-members',
);

export const getWaitListMembers = cache(
  async () => getWaitListMembersServer(),
  'wait-list-members',
);

export const getFamilyAndWaitListMembers = cache(async () => {
  const [members, waitList] = await Promise.all([
    getFamilyMembers(),
    getWaitListMembers(),
  ]);
  return { members, waitList };
}, 'family-and-wait-list-members');

export const getRecentMember = cache(
  async () => getRecentMemberServer(),
  'recent-family-member',
);

export const updateFamily = action((formData: FormData) =>
  updateFamilyServer(formData),
);

export const deleteFamily = action(() => deleteFamilyServer());

export const cancelFamilyJoin = action(() => cancelFamilyJoinServer());
