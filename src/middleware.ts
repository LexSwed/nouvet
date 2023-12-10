import { createMiddleware, setCookie } from '@solidjs/start/server';
import { RETURN_URL_COOKIE } from './server/const';
import { validateUser } from './server/lucia';

export default createMiddleware({
  onRequest: [
    async function checkFamilyUserAuth(event) {
      const { pathname } = new URL(event.request.url);
      try {
        if (pathname === '/family/login') {
          const user = await validateUser(event);
          if (user) {
            event.locals.user = user;
            return new Response(null, {
              status: 302,
              headers: {
                Location: `/family`,
              },
            });
          }
          return;
        }
        if (pathname.startsWith('/family')) {
          const user = await validateUser(event);
          if (user) {
            event.locals.user = user;
            return;
          }

          setCookie(event, RETURN_URL_COOKIE, event.request.url, {
            httpOnly: true,
            maxAge: 60 * 5, // 5 minutes
          });
          return new Response(null, {
            status: 302,
            headers: {
              Location: `/family/login`,
            },
          });
        }
      } catch (error) {
        console.error(error);
        return new Response(null, {
          status: 403,
        });
      }
    },
  ],
});
