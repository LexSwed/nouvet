import { cache } from '@solidjs/router';
import { prefix } from '@solid-primitives/i18n';

import type CommonDict from './locales/en/common.json';
import type WWWWDict from './locales/en/www.json';

export const acceptedLocales = ['en', 'es'] as const;

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

export const getDictionary = cache(
  async (locale: Locale, module: i18nModule) => {
    'use server';
    return fetchDictionary(locale, module);
  },
  'translations',
);
