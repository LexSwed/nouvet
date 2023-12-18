import type { FetchEvent } from '@solidjs/start/server/types';
import {
  custom,
  object,
  string,
  type BaseValidation,
  type ErrorMessage,
  actionIssue,
  actionOutput,
  picklist,
  safeParse,
  type Output,
  parse,
  ValiError,
} from 'valibot';
import { getCookie, setCookie } from 'vinxi/server';
import { acceptedLocales } from '~/i18n/const';

const USER_PREFERENCES_COOKIE = 'nouvet_user_preferences';

const cookieSchema = object({
  locale: string('locale is empty', [validLocale()]),
  // timeZone: date(),
  measurementSystem: picklist(['imperial', 'metrical']),
});

type UserPreferencesSchema = Output<typeof cookieSchema>;

/**
 * Returns user preferences from the cookie.
 * @throws {ValiError} if the cookie is not set, expired, or unsupported values are stored.
 */
export const getUserPreferences = (
  event: FetchEvent,
): UserPreferencesSchema => {
  const cookieString = getCookie(event, USER_PREFERENCES_COOKIE) || '';
  return parse(cookieSchema, JSON.parse(cookieString));
};

/**
 * Saves user preferences to a cookie for 30 days if all the values are correct.
 * @throws {ValiError} if locale or measurements system is not supported.
 */
export const saveUserPreferences = (
  event: FetchEvent,
  preferences: UserPreferencesSchema,
) => {
  const parsed = parse(cookieSchema, preferences);
  setCookie(event, USER_PREFERENCES_COOKIE, JSON.stringify(parsed), {
    sameSite: 'lax',
    secure: true,
    /** Login session expires earlier, so login callback should update this cookie preferences. */
    maxAge: 180 * 24 * 60 * 60,
  });
};

export function validLocale<TInput extends string>(
  message: ErrorMessage = 'Invalid Locale Tag',
): BaseValidation<TInput> & { type: 'locale' } {
  return {
    type: 'locale',
    async: false,
    message,
    _parse(input) {
      if (!input) return actionIssue(this.type, this.message, input);
      try {
        const locale = new Intl.Locale(input);
        return acceptedLocales.includes(
          locale.language as (typeof acceptedLocales)[number],
        )
          ? actionOutput(input)
          : actionIssue(this.type, this.message, input);
      } catch {}

      return actionIssue(this.type, this.message, input);
    },
  };
}
