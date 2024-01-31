'use server';

import { flatten as valiFlatten, type ValiError } from 'valibot';

import { getDictionary } from '~/server/i18n';
import type ErrorsDict from '~/server/i18n/locales/en/errors.json';

export async function translateErrorTokens<T extends Record<string, unknown>>(
  error: ValiError,
): Promise<Partial<Record<keyof T, string>>> {
  const t = await getDictionary('errors');
  const flat: Partial<Record<keyof T, string>> = {};
  for (const [key, issue] of Object.entries(valiFlatten(error).nested)) {
    if (issue) {
      // @ts-expect-error I know what I'm doing
      flat[key] =
        `errors.${issue[0]}` in t
          ? // @ts-expect-error dictionary type is too correct
            t[`errors.${issue[0]}`]
          : issue[0];
    }
  }
  return flat;
}

export type ErrorKeys = keyof typeof ErrorsDict;
