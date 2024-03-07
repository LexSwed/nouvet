'use server';

import { createHmac } from 'node:crypto';
import { getRequestEvent } from 'solid-js/web';
import { alphabet, generateRandomString } from 'oslo/crypto';

import {
  createFamilyInviteAndRemoveOldOnes,
  joinFamilyByInviteCode,
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
    return { url: null, expirationUnix: null, failed: true };
  }
}

export async function parseFamilyInvite(inviteCode: string) {
  const user = await getRequestUser();
  const hashedCode = hash(inviteCode);
  const invite = await joinFamilyByInviteCode(user.userId, hashedCode);
  console.log({ hashedCode, invite: invite });
  // TODO: set approval process. By default family is visible, but no animals are.
  // TODO: allow family owners to approve access
  return invite?.id;
}

function hash(inviteCode: string) {
  return createHmac('sha256', env.INVITES_SECRET)
    .update(inviteCode)
    .digest('hex');
}
