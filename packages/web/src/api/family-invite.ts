'use server';

import { getRequestEvent } from 'solid-js/web';

import { getRequestUser } from '~/server/queries/getUserSession';

export async function createFamilyInvite() {
  const user = await getRequestUser();
  const event = getRequestEvent();
  const url = `${new URL(event!.request.url).origin}/family/invite/${user.userId}`;
  return { url };
}
