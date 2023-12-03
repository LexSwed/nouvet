import { resolveTemplate, translator } from '@solid-primitives/i18n';
import { createAsync } from '@solidjs/router';
import { getDictionary } from '~/i18n/i18n';

export const createTranslator = (
  i18nModule: Parameters<typeof getDictionary>[1],
) => {
  const dict = createAsync(() => getDictionary('en', i18nModule));

  return translator(dict, resolveTemplate);
};
