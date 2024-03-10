'use server';

import { createHmac } from 'node:crypto';
import { getRequestEvent } from 'solid-js/web';
import { alphabet, generateRandomString } from 'oslo/crypto';

import {
  createFamilyInviteAndRemoveOldOnes,
  getFamilyInvitationInfo,
  joinFamilyByInviteCode,
} from '~/server/db/queries/getFamilyInvite';
import { getRequestUser } from '~/server/db/queries/getUserSession';

import { env } from '../env';

// TODO: Heavily rate limit this
export async function getFamilyInvite() {
  try {
    const user = await getRequestUser();
    const event = getRequestEvent();

    const inviteCode = generateRandomString(16, alphabet('a-z', 'A-Z', '0-9'));
    const hash = createHmac('sha256', env.INVITES_SECRET)
      .update(inviteCode)
      .digest('hex');
    const invite = await createFamilyInviteAndRemoveOldOnes(user.userId, hash);

    const url = new URL(
      `${new URL(event!.request.url).origin}/app/family/invite/${inviteCode}`,
    );

    const expiredAt = (invite.expiresAt - Date.now() / 1000) / 60;

    return {
      url: url.toString(),
      expiresIn: new Intl.RelativeTimeFormat(user.locale, {
        style: 'long',
        numeric: 'auto',
      }).format(expiredAt, 'minutes'),
    };
  } catch (error) {
    console.error(error);
    return { failed: true };
  }
}

export async function checkFamilyInvite(inviteCode: string) {
  const hashedCode = hash(inviteCode);
  const invite = await getFamilyInvitationInfo(hashedCode);
  return invite;
}

export async function joinFamily(formData: FormData) {
  const currentUser = await getRequestUser();
  const inviteCode = formData.get('invite-code')!.toString().trim();
  if (!inviteCode) throw new Error('Missing invite-code');
  await joinFamilyByInviteCode(currentUser.userId, hash(inviteCode));
}

function hash(inviteCode: string) {
  return createHmac('sha256', env.INVITES_SECRET)
    .update(inviteCode)
    .digest('hex');
}
