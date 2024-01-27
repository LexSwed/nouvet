'use server';

import { getRequestEvent } from 'solid-js/web';

import { getRequestUser } from './user-session';

/**
 * Returns current user from request cookies.
 * @throws {ValiError} - when the cookie is missing, expired, or stores invalid data.
 */
export const getRequestUserSafe = () => {
  const event = getRequestEvent();
  return getRequestUser(event!);
};
