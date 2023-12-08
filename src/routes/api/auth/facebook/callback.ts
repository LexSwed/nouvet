import { type PageEvent } from '@solidjs/start/server/types';
import { OAuth2RequestError } from 'arctic';
import { parseCookies } from 'oslo/cookie';
import { createUser, getUserByFacebookId } from '~/db/queries/family';
import { useFacebookAuth, useLucia } from '~/lib/utils/lucia';

export const GET = async ({ request }: PageEvent) => {
  const cookies = parseCookies(request.headers.get('Cookie') ?? '');
  const stateCookie = cookies.get('oauth_state') ?? null;
  const facebookAuth = useFacebookAuth();

  const url = new URL(request.url);
  const state = url.searchParams.get('state');
  const code = url.searchParams.get('code');

  // verify state
  if (!state || !stateCookie || !code || stateCookie !== state) {
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const tokens = await facebookAuth.validateAuthorizationCode(code);
    const facebookUser = await facebookAuth.getUser(tokens.accessToken);
    const lucia = useLucia();

    const existingUser = await getUserByFacebookId(facebookUser.id);

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/family',
          'Set-Cookie': sessionCookie.serialize(),
        },
      });
    }

    const user = await createUser({
      name: facebookUser.name,
      facebookId: facebookUser.id,
    });

    const session = await lucia.createSession(user!.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/',
        'Set-Cookie': sessionCookie.serialize(),
      },
    });
  } catch (error) {
    console.log(error);
    if (error instanceof OAuth2RequestError) {
      // bad verification code, invalid credentials, etc
      return new Response(null, {
        status: 400,
      });
    }
    return new Response(null, {
      status: 500,
    });
  }
};
