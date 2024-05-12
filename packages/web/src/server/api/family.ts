import { action, cache } from '@solidjs/router';

import {
  cancelFamilyJoinServer,
  deleteFamilyServer,
  getFamilyMembersServer,
  updateFamilyServer,
} from './family.server';

export const getFamilyMembers = cache(
  async () => getFamilyMembersServer(),
  'family-members',
);

export const updateFamily = action(
  (formData: FormData) => updateFamilyServer(formData),
  'update-family',
);

export const deleteFamily = action(() => deleteFamilyServer(), 'delete-family');

export const cancelFamilyJoin = action(
  () => cancelFamilyJoinServer(),
  'cancel-family-join',
);
