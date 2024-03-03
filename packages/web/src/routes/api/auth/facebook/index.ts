import { generateState } from 'arctic';
import { sendRedirect } from 'vinxi/http';

import { setFacebookOAuthStateCookie, useFacebookAuth } from './_shared';

export const GET = async () => {
  const state = generateState();
  const facebook = useFacebookAuth();
  const url = await facebook.createAuthorizationURL(state);

  setFacebookOAuthStateCookie(state);

  return sendRedirect(url.toString());
};
