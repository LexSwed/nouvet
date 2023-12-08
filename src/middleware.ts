import { createMiddleware } from '@solidjs/start/server';
import { validate } from './server/lucia';

export default createMiddleware({
  onRequest: [
    // @ts-expect-error I'm pretty sure I don't have to return Response
    async function checkFamilyUserAuth(event) {
      const { pathname } = new URL(event.request.url);
      try {
        switch (true) {
          case pathname === '/family/login': {
            const isValid = await validate(event);
            return isValid
              ? new Response(null, {
                  status: 302,
                  headers: {
                    Location: `/family`,
                  },
                })
              : undefined;
          }
          case pathname.startsWith('/family'): {
            const isValid = await validate(event);
            return isValid
              ? undefined
              : new Response(null, {
                  status: 302,
                  headers: {
                    Location: `/family/login?returnUrl=${event.request.url}`,
                  },
                });
          }
          default: {
            return undefined;
          }
        }
      } catch (error) {
        return new Response(null, {
          status: 403,
        });
      }
    },
  ],
});
