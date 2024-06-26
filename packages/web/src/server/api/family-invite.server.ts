'use server';

import { createHmac, randomBytes } from 'node:crypto';
import { json, redirect } from '@solidjs/router';
import { getRequestEvent } from 'solid-js/web';
import * as v from 'valibot';

import { getRequestUser } from '~/server/auth/request-user';
import { createFamilyInvite } from '~/server/db/queries/familyCreateInvite';
import { familyInvitationInfo } from '~/server/db/queries/familyInvitationInfo';
import { familyInvite } from '~/server/db/queries/familyInvite';
import {
  joinFamilyByInvitationHash,
  requestFamilyAdmissionByInviteCode,
} from '~/server/db/queries/familyJoin';
import { env } from '~/server/env';
import { IncorrectFamilyInvite, InviteeNotInWaitList } from '~/server/errors';

import { acceptUserToFamily } from '../db/queries/familyAcceptUser';
import { familyRemoveFromWaitList } from '../db/queries/familyRemoveFromWaitList';
import { translateErrorTokens } from '../utils';

import { getFamilyMembers } from './family';
import { getUserPets } from './pet';
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
    return json(
      { error: 'Something went wrong' },
      { revalidate: [], status: 500 },
    );
  }
}

function createHash(code: string) {
  return createHmac('sha256', env.INVITES_SECRET).update(code).digest('hex');
}

export const checkFamilyInviteServer = async (inviteCode: string) => {
  const user = await getRequestUser();
  try {
    const invite = await familyInvitationInfo(inviteCode, user.userId);

    if (!invite) throw new IncorrectFamilyInvite('Invite does not exist');

    return { invite };
  } catch (error) {
    console.error(error);
    return json(
      {
        error,
      },
      { status: 400, revalidate: [] },
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
    return json(
      { error: 'Something went wrong' },
      { status: 500, revalidate: [] },
    );
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
    return json(
      { error: 'Something went wrong' },
      { status: 500, revalidate: [] },
    );
  }
};

const WaitListActionSchema = v.object({
  action: v.picklist(['accept', 'decline']),
  userId: v.pipe(v.string(), v.trim(), v.nonEmpty()),
});
export const moveUserFromTheWaitListServer = async (formData: FormData) => {
  try {
    const data = v.parse(WaitListActionSchema, {
      action: formData.get('action'),
      userId: formData.get('user-id'),
    });
    const user = await getRequestUser();

    if (data.action === 'accept') {
      const family = await acceptUserToFamily({
        familyOwnerId: user.userId,
        inviteeId: data.userId,
      });

      return json(family, {
        revalidate: [getFamilyMembers.key, getUserFamily.key, getUserPets.key],
      });
    } else {
      const family = await familyRemoveFromWaitList({
        familyOwnerId: user.userId,
        waitListMemberId: data.userId,
      });
      return json(family, {
        revalidate: [getFamilyMembers.key],
      });
    }
  } catch (error) {
    if (v.isValiError(error)) {
      return json(
        { errors: translateErrorTokens(error) },
        { status: 422, revalidate: [] },
      );
    }
    if (error instanceof InviteeNotInWaitList) {
      return json(
        { error: 'Something went wrong' },
        {
          status: 500,
          revalidate: [getFamilyMembers.key],
        },
      );
    }
    console.error(error);
    return json(
      { error: 'Something went wrong' },
      { status: 500, revalidate: [] },
    );
  }
};
