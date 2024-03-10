import { action, cache, redirect } from '@solidjs/router';

import {
  checkFamilyInvite as checkFamilyInviteServer,
  getFamilyInvite as getFamilyInviteServer,
  joinFamily as joinFamilyServer,
} from './family-invite.server';

export const getFamilyInvite = cache(
  () => getFamilyInviteServer(),
  'family-invite-code',
);

export const checkFamilyInvite = cache(
  (inviteCode: string) => checkFamilyInviteServer(inviteCode),
  'accept-family-invite',
);

export const joinFamily = action(async (formData: FormData) => {
  'use server';
  await joinFamilyServer(formData);
  return redirect('/app');
});
