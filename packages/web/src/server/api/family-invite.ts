import { cache } from '@solidjs/router';

import {
  checkFamilyInvite as checkFamilyInviteServer,
  getFamilyInvite as getFamilyInviteServer,
} from './family-invite.server';

export const getFamilyInvite = cache(
  () => getFamilyInviteServer(),
  'family-invite-code',
);

export const checkFamilyInvite = cache(
  (inviteCode: string) => checkFamilyInviteServer(inviteCode),
  'accept-family-invite',
);
