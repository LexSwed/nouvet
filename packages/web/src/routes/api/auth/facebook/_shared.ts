import { getRequestEvent, type RequestEvent } from 'solid-js/web';
import { Facebook } from 'arctic';
import { deleteCookie, getCookie, setCookie } from 'vinxi/server';

import { env } from '~/server/env';

const FACEBOOK_OAUTH_STATE_COOKIE = 'oauth_state';

export function setFacebookOAuthStateCookie(state: string) {
  setCookie(FACEBOOK_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: env.PROD,
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });
}

export function getFacebookOAuthStateCookie(event: RequestEvent) {
  const cookieString = getCookie(event, FACEBOOK_OAUTH_STATE_COOKIE) ?? null;
  if (cookieString) {
    deleteCookie(event, FACEBOOK_OAUTH_STATE_COOKIE);
  }
  return cookieString;
}

export const useFacebookAuth = () => {
  const event = getRequestEvent();
  const { origin } = new URL(event!.request.url);
  return new Facebook(
    env.FACEBOOK_APP_ID,
    env.FACEBOOK_APP_SECRET,
    `${origin}/api/auth/facebook/callback`,
  );
};
