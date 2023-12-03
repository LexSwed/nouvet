import { prefix, resolveTemplate, translator } from '@solid-primitives/i18n';
import { cache, createAsync } from '@solidjs/router';

import { getRequestEvent } from 'solid-js/web';
import { type acceptedLocales } from './const';
import { getLocale } from './locale';
import type CommonDict from './locales/en/common.json';
import type WWWWDict from './locales/en/www.json';

export type Locale = (typeof acceptedLocales)[number];
type Namespace = 'www';

type ModulesMap = Record<Namespace, typeof WWWWDict>;

async function fetchDictionary(locale: Locale = 'en', namespace: Namespace) {
  'use server';
  const commonDict = await (import(`./locales/${locale}/common.json`).then(
    (common) => common.default,
  ) as Promise<typeof CommonDict>);

  const commonPrefixedDict = prefix(commonDict, 'common');
  const routeModuleDict = await (import(
    `./locales/${locale}/${namespace}.json`
  ).then((common) => common.default) as Promise<ModulesMap[typeof namespace]>);
  const modulePrefixedDict = prefix(routeModuleDict, namespace);

  return {
    ...commonPrefixedDict,
    ...modulePrefixedDict,
  };
}

export const getDictionary = cache(async (namespace: Namespace) => {
  'use server';
  const event = getRequestEvent();
  if (!event)
    throw new Error(
      "Wrong execution environment. Check if 'use server' directive is correctly applied.",
    );
  const locale = getLocale(event.request);
  return fetchDictionary(locale.language as Locale, namespace);
}, 'translations');

export const createTranslator = (namespace: Namespace) => {
  const dict = createAsync(() => getDictionary(namespace), {
    deferStream: true,
  });

  return translator(dict, resolveTemplate);
};
