import { flatten as valiFlatten, type ValiError } from 'valibot';

import { getDictionary } from '~/i18n';

export function flatten(error: ValiError) {
  const t = getDictionary('app');
  const flat: Record<string, string> = {};
  for (const [key, issue] of Object.entries(valiFlatten(error).nested)) {
    if (issue) {
      flat[key] = issue[0];
    }
  }
  return flat;
}
