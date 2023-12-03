import { prefix, resolveTemplate, translator } from '@solid-primitives/i18n';
import { cache, createAsync } from '@solidjs/router';

import { getRequestEvent } from 'solid-js/web';
import { type acceptedLocales } from './const';
import { getLocale } from './locale';
import type CommonDict from './locales/en/common.json';
import type WWWWDict from './locales/en/www.json';

export type Locale = (typeof acceptedLocales)[number];
type i18nModule = 'www';

type ModulesMap = Record<i18nModule, typeof WWWWDict>;

async function fetchDictionary(locale: Locale = 'en', routeModule: i18nModule) {
  'use server';
  const commonDict = await (import(`./locales/${locale}/common.json`).then(
    (common) => common.default,
  ) as Promise<typeof CommonDict>);

  const commonPrefixedDict = prefix(commonDict, 'common');
  const routeModuleDict = await (import(
    `./locales/${locale}/${routeModule}.json`
  ).then((common) => common.default) as Promise<
    ModulesMap[typeof routeModule]
  >);
  const modulePrefixedDict = prefix(routeModuleDict, routeModule);

  return {
    ...commonPrefixedDict,
    ...modulePrefixedDict,
  };
}

export const getDictionary = cache(async (module: i18nModule) => {
  'use server';
  const event = getRequestEvent();
  if (!event)
    throw new Error(
      "Wrong execution environment. Check if 'use server' directive is correctly applied.",
    );
  const locale = getLocale(event.request);
  return fetchDictionary(locale.language as Locale, module);
}, 'translations');

export const createTranslator = (i18nModule: i18nModule) => {
  const dict = createAsync(() => getDictionary(i18nModule), {
    deferStream: true,
  });

  return translator(dict, resolveTemplate);
};
