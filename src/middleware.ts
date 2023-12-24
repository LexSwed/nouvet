import { createMiddleware, setCookie } from '@solidjs/start/server';
import { RETURN_URL_COOKIE } from './server/const';
import { validateUser } from './server/lucia';

export default createMiddleware({
  onRequest: [
    async function checkUserAuth(event) {
      const { pathname } = new URL(event.request.url);
      try {
        if (pathname === '/app/login') {
          const user = await validateUser(event);
          if (user) {
            event.locals.user = user;
            return new Response(null, {
              status: 302,
              headers: {
                Location: `/app`,
              },
            });
          }
          return;
        }
        if (pathname.startsWith('/app')) {
          const user = await validateUser(event);
          if (user) {
            event.locals.user = user;
            return;
          }

          setCookie(
            event,
            RETURN_URL_COOKIE,
            new URL(event.request.url).pathname,
            {
              httpOnly: true,
              maxAge: 10 * 60, // 10 minutes
            },
          );
          return new Response(null, {
            status: 302,
            headers: {
              Location: `/app/login`,
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
