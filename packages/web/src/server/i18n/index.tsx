import { prefix, resolveTemplate, translator } from '@solid-primitives/i18n';
import { cache, createAsync } from '@solidjs/router';
import { type JSX, type ParentProps } from 'solid-js';
import { getRequestEvent } from 'solid-js/web';

import type { acceptedLocaleLanguageTag } from './locale';
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

const localeFiles = import.meta.glob('./locales/*/*.json', {
  import: 'default',
});

async function fetchDictionary<T extends Namespace>(
  locale: Locale = 'en',
  namespace: T,
) {
  const commonDict = (await localeFiles[
    `./locales/${locale}/common.json`
  ]()) as typeof CommonDict;

  const commonPrefixedDict = prefix(commonDict, 'common');
  const routeModuleDict = (await localeFiles[
    `./locales/${locale}/${namespace}.json`
  ]()) as NamespaceMap[T];
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
    const { locale } = event.locals;
    return fetchDictionary(
      (locale as Intl.Locale).language as Locale,
      namespace,
    );
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
