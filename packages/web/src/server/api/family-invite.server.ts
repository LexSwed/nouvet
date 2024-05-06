'use server';

import { createHmac, randomBytes } from 'node:crypto';
import { json, redirect } from '@solidjs/router';
import { getRequestEvent } from 'solid-js/web';
import {
  coerce,
  integer,
  number,
  object,
  parse,
  picklist,
  ValiError,
} from 'valibot';

import { getRequestUser } from '~/server/auth/request-user';
import { createFamilyInvite } from '~/server/db/queries/familyCreateInvite';
import { familyInvitationInfo } from '~/server/db/queries/familyInvitationInfo';
import { familyInvite } from '~/server/db/queries/familyInvite';
import {
  joinFamilyByInvitationHash,
  requestFamilyAdmissionByInviteCode,
} from '~/server/db/queries/familyJoin';
import { env } from '~/server/env';
import { UserAlreadyInFamily } from '~/server/errors';

import { acceptUserToFamily } from '../db/queries/familyAcceptUser';
import { revokeUserMembership } from '../db/queries/familyRevoke';
import { translateErrorTokens } from '../utils';

import { getFamilyMembers } from './family';
import { getUserFamily } from './user';

// TODO: Heavily rate limit this
export async function getFamilyInviteServer() {
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

export const checkFamilyInviteServer = async (inviteCode: string) => {
  const user = await getRequestUser();
  try {
    const invite = await familyInvitationInfo(inviteCode, user.userId);
    return { invite };
  } catch (error) {
    if (error instanceof UserAlreadyInFamily) {
      return json(
        {
          failed: true,
          reason: 100,
        },
        { status: 400 },
      );
    } else {
      console.error(error);
    }
    return json(
      {
        failed: true,
      },
      { status: 400 },
    );
  }
};

export const joinFamilyWithLinkServer = async (formData: FormData) => {
  const currentUser = await getRequestUser();
  const inviteCode = formData.get('invite-code')!.toString().trim();
  if (!inviteCode || !currentUser.userId) {
    // TODO: error translation
    return json(
      { errors: { inviteCode: 'Missing invite code' } },
      { status: 422 },
    );
  }

  try {
    await requestFamilyAdmissionByInviteCode(inviteCode, currentUser.userId);

    return redirect(`/app/family`);
  } catch (error) {
    console.error(error);
    return json({ error: 'Something went wrong' }, { status: 500 });
  }
};

export const joinFamilyWithQRCodeServer = async (invitationHash: string) => {
  try {
    const currentUser = await getRequestUser();
    if (!invitationHash || !currentUser.userId) {
      // TODO: error translation
      return json(
        { errors: { inviteCode: 'Missing invitation hash.' } },
        { status: 422 },
      );
    }
    // TODO: error handling
    const family = await joinFamilyByInvitationHash(
      invitationHash,
      currentUser.userId,
    );
    /** Revalidation happens after user sees the success dialog */
    return json(family, { revalidate: [] });
  } catch (error) {
    return json({ error: 'Something went wrong' }, { status: 500 });
  }
};

const WaitListActionSchema = object({
  action: picklist(['accept', 'decline']),
  userId: coerce(number([integer()]), Number),
});
export const moveUserFromTheWaitListServer = async (formData: FormData) => {
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
      await revokeUserMembership({
        familyOwnerId: user.userId,
        familyMemberId: data.userId,
      });
    }

    return json(data, {
      revalidate: [getFamilyMembers.key, getUserFamily.key],
    });
  } catch (error) {
    if (error instanceof ValiError) {
      return json({ errors: translateErrorTokens(error) }, { status: 422 });
    }
    return json({ error: 'Something went wrong' }, { status: 500 });
  }
};
