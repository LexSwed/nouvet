import { action, cache, redirect } from '@solidjs/router';

import { getRequestUser } from '~/server/auth/request-user';

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
  const currentUser = await getRequestUser();
  const inviteCode = formData.get('invite-code')!.toString().trim();
  if (!inviteCode || !currentUser.userId)
    throw new Error('Missing invite-code');
  // TODO: error handling
  await joinFamilyServer(inviteCode, currentUser.userId);

  return redirect('/app');
}, 'join-family');
