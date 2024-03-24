'use server';

import { randomBytes } from 'node:crypto';
import { getRequestEvent } from 'solid-js/web';

import { getRequestUser } from '~/server/auth/request-user';
import {
  createFamilyInvite as dbCreateFamilyInvite,
  getFamilyInvite as dbGetFamilyInvite,
  getFamilyInvitationInfo,
  joinFamilyByInviteCode,
} from '~/server/db/queries/familyInvite';

// TODO: Heavily rate limit this
export async function getFamilyInvite() {
  try {
    const user = await getRequestUser();
    const event = getRequestEvent();

    let invite = await dbGetFamilyInvite(user.userId);

    if (!invite) {
      const inviteCode = randomBytes(10).toString('hex');
      invite = await dbCreateFamilyInvite(user.userId, inviteCode);
    }

    const url = new URL(
      `${new URL(event!.request.url).origin}/app/family/invite/${invite.inviteCode}`,
    );

    const expiresIn = Math.floor((invite.expiresAt - Date.now() / 1000) / 60);

    return {
      url: url.toString(),
      expiresIn: new Intl.RelativeTimeFormat(user.locale, {
        style: 'long',
        numeric: 'auto',
      }).format(expiresIn, 'minutes'),
    };
  } catch (error) {
    console.error(error);
    return { failed: true };
  }
}

export async function checkFamilyInvite(inviteCode: string) {
  const invite = await getFamilyInvitationInfo(inviteCode);
  return invite;
}

export async function joinFamily(formData: FormData) {
  const currentUser = await getRequestUser();
  const inviteCode = formData.get('invite-code')!.toString().trim();
  if (!inviteCode) throw new Error('Missing invite-code');
  await joinFamilyByInviteCode(currentUser.userId, inviteCode);
}
