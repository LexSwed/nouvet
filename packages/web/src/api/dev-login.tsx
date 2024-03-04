'use server';

import { json } from '@solidjs/router';
import { deleteCookie, getCookie, sendRedirect } from 'vinxi/http';

import { createUserSession } from '~/server/auth/user-session';
import { RETURN_URL_COOKIE } from '~/server/const';

export const loginDev = async (formData: FormData) => {
  const returnUrl = getCookie(RETURN_URL_COOKIE);

  if (returnUrl) {
    deleteCookie(RETURN_URL_COOKIE);
  }
  const name = formData.get('name');
  if (!name) {
    return json({ failed: true }, { status: 500, revalidate: [] });
  }
  try {
    await createUserSession({
      id: name.toString(),
      locale: 'en-GB',
      measurementSystem: 'metrical',
    });

    return sendRedirect(returnUrl || '/app');
  } catch (error) {
    console.error(error);
  }
};
