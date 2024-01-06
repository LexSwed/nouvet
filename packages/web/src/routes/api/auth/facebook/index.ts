import { sendRedirect } from '@solidjs/start/server';
import { type PageEvent } from '@solidjs/start/server/types';
import { generateState } from 'arctic';

import { setFacebookOAuthStateCookie, useFacebookAuth } from './_shared';

export const GET = async (event: PageEvent) => {
  const state = generateState();
  const facebook = useFacebookAuth();
  const url = await facebook.createAuthorizationURL(state);

  setFacebookOAuthStateCookie(event, state);

  return sendRedirect(event, url.toString());
};
