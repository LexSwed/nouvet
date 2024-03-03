import { createAsync } from '@solidjs/router';
import { createMemo, type Accessor } from 'solid-js';

import { getUser } from '~/api/user';

/**
 * Formats date using user's locale.
 * Make sure the date string is in Unix or ISO format.
 */
export function createFormattedDate(date: Accessor<Date | undefined>) {
  const user = createAsync(() => getUser());
  const formatted = createMemo(() => {
    if (user() && date()) {
      const formatter = Intl.DateTimeFormat(user()!.locale, {
        month: 'long',
        day: 'numeric',
      });
      return formatter.format(date());
    }
    return undefined;
  });

  return formatted;
}
