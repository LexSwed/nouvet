import { action, cache } from '@solidjs/router';

import {
  checkFamilyInviteServer,
  getFamilyInviteServer,
  joinFamilyWithLinkServer,
  joinFamilyWithQRCodeServer,
  moveUserFromTheWaitListServer,
} from './family-invite.server';

export const getFamilyInvite = cache(
  () => getFamilyInviteServer(),
  'family-invite-code',
);

export const checkFamilyInvite = cache(
  async (inviteCode: string) => checkFamilyInviteServer(inviteCode),
  'check-family-invite',
);

export const joinFamilyWithLink = action(
  async (formData: FormData) => joinFamilyWithLinkServer(formData),
  'join-family',
);

export const joinFamilyWithQRCode = action(
  (invitationHash: string) => joinFamilyWithQRCodeServer(invitationHash),
  'join-family-qr',
);

export const moveUserFromTheWaitList = action(
  async (formData: FormData) => moveUserFromTheWaitListServer(formData),
  'move-user-from-the-wait-list',
);
