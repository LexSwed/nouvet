import { type PageEvent } from '@solidjs/start/server/types';
import { generateState } from 'arctic';
import { sendRedirect, setCookie } from '@solidjs/start/server';
import { env } from '~/server/env';
import { useFacebookAuth } from '~/server/lucia';

export const GET = async (event: PageEvent) => {
  const state = generateState();
  const facebook = useFacebookAuth();
  const url = await facebook.createAuthorizationURL(state);

  setCookie(event, 'oauth_state', state, {
    httpOnly: true,
    secure: env.PROD,
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  return sendRedirect(event, url.toString());
};
