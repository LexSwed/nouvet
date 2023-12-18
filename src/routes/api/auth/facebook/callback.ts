import { type PageEvent } from '@solidjs/start/server/types';
import { OAuth2RequestError } from 'arctic';
import { object, parse, string } from 'valibot';
import {
  deleteCookie,
  getCookie,
  sendRedirect,
  setCookie,
} from '@solidjs/start/server';
import { RETURN_URL_COOKIE } from '~/server/const';
import { createUser } from '~/server/db/queries/createUser';
import { getUserByAuthProviderId } from '~/server/db/queries/getUserByAuthProviderId';
import { useFacebookAuth, useLucia } from '~/server/lucia';
import { getLocale } from '~/i18n/locale';
import { saveUserPreferences } from '~/server/userPreferencesCookie';

export const GET = async (event: PageEvent) => {
  const { request } = event;
  const stateCookie = getCookie(event, 'oauth_state') ?? null;
  const facebookAuth = useFacebookAuth();

  const url = new URL(request.url);
  const state = url.searchParams.get('state');
  const code = url.searchParams.get('code');

  // verify state
  if (!state || !stateCookie || !code || stateCookie !== state) {
    console.error('Facebook auth callback is called without state');
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const tokens = await facebookAuth.validateAuthorizationCode(code);
    const facebookUser = await fetchFacebookUser(tokens.accessToken);
    const lucia = useLucia();

    const existingUser = await getUserByAuthProviderId(
      'facebook',
      facebookUser.id,
    );
    const returnUrl = getCookie(event, RETURN_URL_COOKIE);

    if (returnUrl) {
      deleteCookie(event, RETURN_URL_COOKIE);
    }

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);

      setCookie(
        event,
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );

      try {
        saveUserPreferences(event, {
          locale: existingUser.locale!,
          measurementSystem: existingUser.measurementSystem!,
        });
      } catch (error) {
        console.error(
          `Wrong preferences for user ${existingUser.id}: locale ${existingUser.locale}, ${existingUser.measurementSystem}`,
        );
        return sendRedirect(event, returnUrl || '/app');
      }

      return sendRedirect(event, returnUrl || '/app');
    }
    const locale = getLocale(event);

    const measurementSystem =
      locale.region && ['US', 'LR', 'MM'].includes(locale.region)
        ? 'imperial'
        : 'metrical';

    const user = await createUser({
      provider: 'facebook',
      accountProviderId: facebookUser.id,
      name: facebookUser.name,
      locale: locale.baseName,
      measurementSystem: measurementSystem,
    });

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    setCookie(
      event,
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    saveUserPreferences(event, { locale: locale.baseName, measurementSystem });

    return sendRedirect(event, returnUrl || '/app');
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

const facebookUserSchema = object({
  id: string(),
  name: string(),
});
async function fetchFacebookUser(accessToken: string) {
  const url = new URL('https://graph.facebook.com/me');
  url.searchParams.set('access_token', accessToken);
  url.searchParams.set('fields', ['id', 'name', 'picture', 'email'].join(','));
  const response = await fetch(url);

  if (response.ok) {
    const user = (await response.json()) as unknown;
    return parse(facebookUserSchema, user);
  }
  throw new Error(`Couldn't get Facebook user from Facebook API`);
}
