import { generateState } from 'arctic';
import { serializeCookie } from 'oslo/cookie';
import { env } from '~/lib/utils/env';
import { useFacebookAuth } from '~/lib/utils/lucia';

export const GET = async () => {
  const state = generateState();
  const facebook = useFacebookAuth();
  const url = await facebook.createAuthorizationURL(state);
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
