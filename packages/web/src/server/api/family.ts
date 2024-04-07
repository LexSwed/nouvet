import { cache } from '@solidjs/router';

import { familyMembers } from './family.server';

export const allFamilyUsers = cache(
  async () => familyMembers(),
  'family-members',
);
