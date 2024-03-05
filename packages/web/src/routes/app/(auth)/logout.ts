import { sendRedirect } from 'vinxi/http';

import { useLucia } from '~/server/auth/lucia';
import { getRequestUser } from '~/server/db/queries/getUserSession';

export const GET = async () => {
  const user = await getRequestUser();
  const lucia = useLucia();
  await lucia.invalidateSession(user.sessionId);
  return sendRedirect('/');
};
