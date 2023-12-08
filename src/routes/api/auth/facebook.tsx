import { type PageEvent } from '@solidjs/start/server/types';
import { generateState } from 'arctic';
import { serializeCookie } from 'oslo/cookie';
import { env } from '~/server/env';
import { useFacebookAuth } from '~/server/lucia';

export const GET = async (event: PageEvent) => {
  const state = generateState();
  const facebook = useFacebookAuth();
  const url = await facebook.createAuthorizationURL(state);
  console.log(event.request.headers.get('Origin'));
  return new Response(null, {
    status: 302,
    headers: {
      'Location': url.toString(),
      'Set-Cookie': serializeCookie('oauth_state', state, {
        httpOnly: true,
        secure: env.PROD,
        maxAge: 60 * 10, // 10 minutes
        path: '/',
      }),
    },
  });
};
