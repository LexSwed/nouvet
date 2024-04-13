import { sendRedirect } from 'vinxi/http';

import { deleteUserSession } from '~/server/auth/user-session';

export const GET = async () => {
  await deleteUserSession();
  return sendRedirect('/app');
};
