import type { APIHandler } from '@solidjs/start/server';
import { deleteCookie, getCookie, sendRedirect } from 'vinxi/http';

import { createUserSession } from '~/server/auth/user-session';
import { RETURN_URL_COOKIE } from '~/server/const';

export let GET: APIHandler;
if (import.meta.env.DEV) {
  GET = async () => {
    const returnUrl = getCookie(RETURN_URL_COOKIE);

    if (returnUrl) {
      deleteCookie(RETURN_URL_COOKIE);
    }
    try {
      await createUserSession({
        id: 'test',
        locale: 'en-GB',
        measurementSystem: 'metrical',
      });

      return sendRedirect(returnUrl || '/app');
    } catch (error) {
      console.error(error);
    }
  };
}
