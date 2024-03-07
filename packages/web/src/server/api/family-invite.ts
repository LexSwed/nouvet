'use server';

import { createHmac } from 'node:crypto';
import { getRequestEvent } from 'solid-js/web';
import { alphabet, generateRandomString } from 'oslo/crypto';

import {
  createFamilyInviteAndRemoveOldOnes,
  getFamilyInvitationInfo,
} from '~/server/db/queries/getFamilyInvite';
import { getRequestUser } from '~/server/db/queries/getUserSession';

import { env } from '../env';

// TODO: Rate limit this
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

    return {
      url: url.toString(),
      expirationUnix: invite.expiresAt * 1000,
    };
  } catch (error) {
    console.error(error);
    return { failed: true };
  }
}

export async function checkFamilyInvite(inviteCode: string) {
  const hashedCode = hash(inviteCode);
  const invite = await getFamilyInvitationInfo(hashedCode);
  // TODO: set approval process. By default family is visible, but no animals are.
  // TODO: allow family owners to approve access
  return invite;
}

function hash(inviteCode: string) {
  return createHmac('sha256', env.INVITES_SECRET)
    .update(inviteCode)
    .digest('hex');
}
