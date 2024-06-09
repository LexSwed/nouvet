'use server';

import { getRequestEvent } from 'solid-js/web';
import { deleteCookie, getCookie } from 'vinxi/http';

import { createUserSession } from '~/server/auth/user-session';
import { RETURN_URL_COOKIE } from '~/server/const';

export async function loginDevServer(name: string) {
  let returnUrl = getCookie(RETURN_URL_COOKIE);

  if (returnUrl) {
    deleteCookie(RETURN_URL_COOKIE);
  }

  switch (returnUrl) {
    case '/':
    case '/app/login':
    case '/app/logout':
      returnUrl = '/app';
      break;
  }
  try {
    const event = getRequestEvent();
    await createUserSession(event!.nativeEvent, {
      id: +name,
      locale: 'en-GB',
      measurementSystem: 'metrical',
    });

    return { redirectUrl: returnUrl || '/app' };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
