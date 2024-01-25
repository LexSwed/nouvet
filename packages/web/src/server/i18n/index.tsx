import { prefix, resolveTemplate, translator } from '@solid-primitives/i18n';
import { cache, createAsync } from '@solidjs/router';
import { type JSX, type ParentProps } from 'solid-js';
import { getRequestEvent } from 'solid-js/web';

import { getLocale, type acceptedLocaleLanguageTag } from './locale';
import type AppDict from './locales/en/app.json';
import type CommonDict from './locales/en/common.json';
import type ErrorsDict from './locales/en/errors.json';
import type LoginDict from './locales/en/login.json';
import type WWWDict from './locales/en/www.json';

export type Locale = (typeof acceptedLocaleLanguageTag)[number];

type NamespaceMap = {
  common: typeof CommonDict;
  www: typeof WWWDict;
  app: typeof AppDict;
  login: typeof LoginDict;
  errors: typeof ErrorsDict;
};
type Namespace = keyof NamespaceMap;

async function fetchDictionary<T extends Namespace>(
  locale: Locale = 'en',
  namespace: T,
) {
  const commonDict = await (import(`./locales/${locale}/common.json`).then(
    (commonModule) => commonModule.default,
  ) as Promise<typeof CommonDict>);

  const commonPrefixedDict = prefix(commonDict, 'common');
  const routeModuleDict = await (import(
    `./locales/${locale}/${namespace}.json`
  ).then((namespaceModule) => namespaceModule.default) as Promise<
    NamespaceMap[T]
  >);
  const modulePrefixedDict = prefix(routeModuleDict, namespace);

  return {
    ...commonPrefixedDict,
    ...modulePrefixedDict,
  };
}

export const getDictionary = cache(
  async <T extends Namespace>(namespace: T) => {
    'use server';
    const event = getRequestEvent();
    if (!event) {
      throw new Error(
        "Wrong execution environment. Check if 'use server' directive is correctly applied.",
      );
    }
    const locale = await getLocale(event);
    return fetchDictionary(locale.language as Locale, namespace);
  },
  'translations',
);

export const createTranslator = <T extends Namespace>(namespace: T) => {
  const dict = createAsync(() => getDictionary(namespace));
  return translator(dict, resolveTemplate);
};

/**
 * Renders translations strings that might include HTML.
 * Uses innerHTML, so the validation of the tags should happen when accepting translations.
 */
export function T(props: ParentProps): JSX.Element {
  // eslint-disable-next-line solid/no-innerhtml
  return <span innerHTML={`${props.children}`} class="contents" />;
}
