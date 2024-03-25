import { action, cache, json, redirect } from '@solidjs/router';

import { getRequestUser } from '~/server/auth/request-user';

import {
  checkFamilyInvite as checkFamilyInviteServer,
  getFamilyInvite as getFamilyInviteServer,
  joinFamily as joinFamilyServer,
} from './family-invite.server';
import { getUserPets } from './pet';
import { getUserFamily } from './user';

export const getFamilyInvite = cache(
  () => getFamilyInviteServer(),
  'family-invite-code',
);

export const checkFamilyInvite = cache(
  (inviteCode: string) => checkFamilyInviteServer(inviteCode),
  'accept-family-invite',
);

export const joinFamilyThroughLink = action(async (formData: FormData) => {
  'use server';
  const currentUser = await getRequestUser();
  const inviteCode = formData.get('invite-code')!.toString().trim();
  if (!inviteCode || !currentUser.userId)
    throw new Error('Missing invite-code');
  // TODO: error handling
  await joinFamilyServer(inviteCode, currentUser.userId);

  return redirect('/app');
}, 'join-family');

export const joinFamily = action(async (inviteCode: string) => {
  'use server';
  const currentUser = await getRequestUser();
  if (!inviteCode || !currentUser.userId)
    throw new Error('Missing invite-code');
  // TODO: error handling
  const family = await joinFamilyServer(inviteCode, currentUser.userId);
  return json(family, { revalidate: [getUserFamily.key, getUserPets.key] });
}, 'join-family');
