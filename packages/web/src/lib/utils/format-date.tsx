import { createAsync } from '@solidjs/router';
import { createMemo, type Accessor } from 'solid-js';

import { getUser } from '~/server/api/user';

/**
 * Formats date using user's locale.
 * Make sure the date string is in Unix or ISO format.
 */
export function createFormattedDate(
  date: Accessor<Date | undefined>,
  options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  },
) {
  const user = createAsync(() => getUser());
  const formatted = createMemo(() => {
    if (user() && date()) {
      const formatter = new Intl.DateTimeFormat(user()!.locale, options);
      return formatter.format(date());
    }
    return undefined;
  });

  return formatted;
}

/**
 * Formats date using user's locale.
 * Make sure the date string is in Unix or ISO format.
 */
export function createRelativeTimeFormat(
  [date, unit]: [
    date: Accessor<number | undefined>,
    unit: Intl.RelativeTimeFormatUnit,
  ],
  options: Intl.RelativeTimeFormatOptions = {
    style: 'long',
    numeric: 'auto',
  },
) {
  const user = createAsync(() => getUser());
  const formatted = createMemo(() => {
    const value = date();
    if (user() && value !== undefined) {
      const formatter = new Intl.RelativeTimeFormat(user()!.locale, options);
      return formatter.format(value, unit);
    }
    return undefined;
  });

  return formatted;
}
