'use server';

import { getRequestEvent } from 'solid-js/web';
import { alphabet, generateRandomString } from 'oslo/crypto';

import {
  createFamilyInvite as dbCreateFamilyInvite,
  getFamilyInvite as dbGetFamilyInvite,
  getFamilyInvitationInfo,
  joinFamilyByInviteCode,
} from '~/server/db/queries/getFamilyInvite';
import { getRequestUser } from '~/server/db/queries/getUserSession';

// TODO: Heavily rate limit this
export async function getFamilyInvite() {
  try {
    const user = await getRequestUser();
    const event = getRequestEvent();

    let invite = await dbGetFamilyInvite(user.userId);

    if (!invite) {
      const inviteCode = generateRandomString(
        24,
        alphabet('a-z', 'A-Z', '0-9'),
      );
      invite = await dbCreateFamilyInvite(user.userId, inviteCode);
    }

    const url = new URL(
      `${new URL(event!.request.url).origin}/app/family/invite/${invite.inviteCode}`,
    );

    const expiresIn = (invite.expiresAt - Date.now() / 1000) / 60;

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
