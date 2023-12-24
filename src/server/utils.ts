import type { User } from 'lucia';
import { getRequestEvent } from 'solid-js/web';

export function getCurrentUser() {
  const event = getRequestEvent();

  if (
    event &&
    typeof event.locals.user === 'object' &&
    event.locals.user !== null &&
    'id' in event.locals.user
  ) {
    return event.locals.user as User;
  }
  throw new Error('User is not authenticated');
}
