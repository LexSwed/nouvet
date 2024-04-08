'use server';

import { createHmac, randomBytes } from 'node:crypto';
import { getRequestEvent } from 'solid-js/web';

import { getRequestUser } from '~/server/auth/request-user';
import { createFamilyInvite } from '~/server/db/queries/familyCreateInvite';
import { familyInvite } from '~/server/db/queries/familyInvite';
import { env } from '~/server/env';

// TODO: Heavily rate limit this
export async function getFamilyInvite() {
  try {
    const user = await getRequestUser();
    const event = getRequestEvent();

    let invite = await familyInvite(user.userId);

    if (!invite) {
      const inviteCode = randomBytes(8).toString('hex');
      const hash = createHash(inviteCode);
      invite = await createFamilyInvite(user.userId, inviteCode, hash);
    }

    const url = new URL(
      `${new URL(event!.request.url).origin}/app/family/invite/${invite.inviteCode}`,
    );

    // 1 hour. Math.ceil instead of floor to shot it's lasting 1 hour, and it won't be shown if it's expired in < X minutes anyway.
    const expiresIn = Math.ceil((invite.expiresAt - Date.now() / 1000) / 60);

    return {
      url: url.toString(),
      qrString: invite.invitationHash,
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

function createHash(code: string) {
  return createHmac('sha256', env.INVITES_SECRET).update(code).digest('hex');
}
