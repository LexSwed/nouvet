import { action, cache, json, redirect } from '@solidjs/router';
import {
  coerce,
  integer,
  number,
  object,
  parse,
  picklist,
  ValiError,
} from 'valibot';

import { getFamilyMembers } from '~/server/api/family';
import { getUserFamily } from '~/server/api/user';
import { getRequestUser } from '~/server/auth/request-user';
import { familyInvitationInfo } from '~/server/db/queries/familyInvitationInfo';
import {
  joinFamilyByInvitationHash,
  requestFamilyAdmissionByInviteCode,
} from '~/server/db/queries/familyJoin';
import {
  acceptUserToFamily,
  revokeUserInvite,
} from '~/server/db/queries/familyMembers';

import { getFamilyInvite as getFamilyInviteServer } from './family-invite.server';

export const getFamilyInvite = cache(() => {
  'use server';
  // TODO: if vinxi supports tree-shaking modules used within server functions, .server file logic (with crypto and env imports) can be moved here.
  return getFamilyInviteServer();
}, 'family-invite-code');

export const checkFamilyInvite = cache(async (inviteCode: string) => {
  'use server';
  const invite = await familyInvitationInfo(inviteCode);
  return invite;
}, 'accept-family-invite');

export const joinFamilyWithLink = action(async (formData: FormData) => {
  'use server';
  const currentUser = await getRequestUser();
  const inviteCode = formData.get('invite-code')!.toString().trim();
  if (!inviteCode || !currentUser.userId) {
    return json(new Error('Invite code is not provided'), { status: 422 });
  }

  try {
    const family = await requestFamilyAdmissionByInviteCode(
      inviteCode,
      currentUser.userId,
    );

    return redirect(`/app/${family.familyId}`);
  } catch (error) {
    console.error(error);
    return json(error, { status: 422 });
  }
}, 'join-family');

export const joinFamilyWithQRCode = action(async (invitationHash: string) => {
  'use server';
  try {
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
  } catch (error) {
    throw new Error('Invite code is invalid');
  }
}, 'join-family-qr');

const WaitListActionSchema = object({
  action: picklist(['accept', 'decline']),
  userId: coerce(number([integer()]), Number),
});
export const moveUserFromTheWaitList = action(async (formData: FormData) => {
  'use server';
  try {
    const data = parse(WaitListActionSchema, {
      action: formData.get('action'),
      userId: formData.get('user-id'),
    });
    const user = await getRequestUser();

    if (data.action === 'accept') {
      await acceptUserToFamily({
        familyOwnerId: user.userId,
        inviteeId: data.userId,
      });
    } else {
      await revokeUserInvite({
        familyOwnerId: user.userId,
        inviteeId: data.userId,
      });
    }

    return json(data, {
      revalidate: [getFamilyMembers.key, getUserFamily.key],
    });
  } catch (error) {
    return json({ error }, { status: error instanceof ValiError ? 422 : 500 });
  }
}, 'move-user-from-the-wait-list');
