'use server';

import { flatten as valiFlatten, type ValiError } from 'valibot';

import { getDictionary } from '~/server/i18n';

export async function translateErrorTokens(error: ValiError) {
  const t = await getDictionary('errors');
  const flat: Record<string, string> = {};
  for (const [key, issue] of Object.entries(valiFlatten(error).nested)) {
    if (issue) {
      flat[key] =
        `errors.${issue[0]}` in t
          ? // @ts-expect-error dictionary type is too correct
            t[`errors.${issue[0]}`]
          : issue[0];
    }
  }
  return flat;
}
