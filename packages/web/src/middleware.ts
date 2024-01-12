import {
  createMiddleware,
  sendRedirect,
  setCookie,
  type FetchEvent,
} from '@solidjs/start/server';

import { getLocale } from './i18n/locale';
import { validateAuthSession } from './server/auth/user-session';
import { RETURN_URL_COOKIE } from './server/const';

export default createMiddleware({
  onRequest: [locale, checkUserAuth],
});

async function locale(event: FetchEvent) {
  event.locals.locale = await getLocale(event);
}

async function checkUserAuth(event: FetchEvent) {
  const { pathname } = new URL(event.request.url);
  try {
    if (pathname === '/app/login') {
      const user = await validateAuthSession(event);
      if (user) {
        return sendRedirect(event, `/app`);
      }
      return;
    }
    if (pathname.startsWith('/app')) {
      const user = await validateAuthSession(event);
      if (user) {
        return;
      }

      setCookie(event, RETURN_URL_COOKIE, new URL(event.request.url).pathname, {
        httpOnly: true,
        maxAge: 15 * 60, // 10 minutes
      });
      return sendRedirect(event, `/app/login`, 401);
    }
  } catch (error) {
    console.error(error);
    return sendRedirect(event, `/houston`, 500);
  }
  return;
}
