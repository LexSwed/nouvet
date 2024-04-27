import { action, cache } from '@solidjs/router';

import {
  deleteFamilyServer,
  getFamilyMembersServer,
  updateFamilyServer,
} from './family.server';

export const getFamilyMembers = cache(
  async () => getFamilyMembersServer(),
  'family-members',
);

export const updateFamily = action((formData: FormData) =>
  updateFamilyServer(formData),
);

export const deleteFamily = action(() => deleteFamilyServer());
