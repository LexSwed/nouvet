import { prefix, resolveTemplate, translator } from '@solid-primitives/i18n';
import { cache, createAsync } from '@solidjs/router';

import { type ParentProps } from 'solid-js';
import { getRequestEvent } from 'solid-js/web';
import { type acceptedLocales } from './const';
import { getLocale } from './locale';
import type CommonDict from './locales/en/common.json';
import type WWWWDict from './locales/en/www.json';

export type Locale = (typeof acceptedLocales)[number];
type Namespace = 'www';

type NamespaceMap = Record<Namespace, typeof WWWWDict>;

async function fetchDictionary(locale: Locale = 'en', namespace: Namespace) {
  'use server';
  const commonDict = await (import(`./locales/${locale}/common.json`).then(
    (common) => common.default,
  ) as Promise<typeof CommonDict>);

  const commonPrefixedDict = prefix(commonDict, 'common');
  const routeModuleDict = await (import(
    `./locales/${locale}/${namespace}.json`
  ).then((common) => common.default) as Promise<
    NamespaceMap[typeof namespace]
  >);
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

export const createTranslator = <T extends Namespace = Namespace>(
  namespace: T,
) => {
  const dict = createAsync(() => getDictionary(namespace), {
    deferStream: true,
  });

  return translator(dict, resolveTemplate);
};

/**
 * Renders translations strings that might include HTML.
 * Uses innerHTML, so the validation of the tags should happen when accepting translations.
 */
export function T<T extends Namespace>(
  props: ParentProps<{
    namespace: T;
    i18nKey: keyof NamespaceMap[T];
  }>,
) {
  const t = createTranslator(props.namespace);
  const text = t(
    `${props.namespace}.${String(props.i18nKey)}` as Parameters<typeof t>[0],
  );
  // eslint-disable-next-line solid/no-innerhtml
  return <span innerHTML={text} class="contents" />;
}
