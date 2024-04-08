'use server';

import { flatten as valiFlatten, type ValiError } from 'valibot';

import type ErrorsDict from '~/server/i18n/locales/en/errors.json';

import { getDictionary } from './i18n/dict';

export async function translateErrorTokens<T extends Record<string, unknown>>(
  error: ValiError,
): Promise<Partial<Record<keyof T, string>>> {
  const t = await getDictionary('errors');
  const flat: Partial<Record<keyof T, string>> = {};
  for (const [key, issue] of Object.entries(valiFlatten(error).nested)) {
    if (issue) {
      // @ts-expect-error I know what I'm doing
      flat[key] =
        issue[0] in t
          ? // @ts-expect-error I know what I'm doing
            t[`${issue[0]}`]
          : issue[0];
    }
  }
  return flat;
}

export type ErrorKeys = keyof typeof ErrorsDict;

export async function timeout(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
