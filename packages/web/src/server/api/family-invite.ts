import { action, cache, json, redirect } from '@solidjs/router';

import { getRequestUser } from '~/server/auth/request-user';

import {
  joinFamilyByInvitationHash,
  requestFamilyAdmissionByInviteCode,
} from '../db/queries/familyInvite';

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

export const joinFamilyWithLink = action(async (formData: FormData) => {
  'use server';
  const currentUser = await getRequestUser();
  const inviteCode = formData.get('invite-code')!.toString().trim();
  if (!inviteCode || !currentUser.userId)
    throw new Error('Missing invite-code.');
  // TODO: error handling
  await requestFamilyAdmissionByInviteCode(inviteCode, currentUser.userId);

  return redirect('/app');
}, 'join-family');

export const joinFamilyWithQRCode = action(async (invitationHash: string) => {
  'use server';
  const currentUser = await getRequestUser();
  if (!invitationHash || !currentUser.userId)
    throw new Error('Missing invitation hash.');
  // TODO: error handling
  const family = await joinFamilyByInvitationHash(
    invitationHash,
    currentUser.userId,
  );
  /** Revalidation happens after user sees the success dialog */
  return json(family, { revalidate: [] });
}, 'join-family');
