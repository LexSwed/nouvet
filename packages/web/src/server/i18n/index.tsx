import { resolveTemplate, translator } from '@solid-primitives/i18n';
import { cache, createAsync } from '@solidjs/router';
import { type JSX, type ParentProps } from 'solid-js';
import { getRequestEvent } from 'solid-js/web';

import type AppDict from './locales/en/app.json';
import type CommonDict from './locales/en/common.json';
import type ErrorsDict from './locales/en/errors.json';
import type LoginDict from './locales/en/login.json';
import type PetFormsDict from './locales/en/pet-forms.json';
import type WWWDict from './locales/en/www.json';
import type { SupportedLocale } from './shared';

type NamespaceMap = {
  'common': typeof CommonDict;
  'www': typeof WWWDict;
  'app': typeof AppDict;
  'login': typeof LoginDict;
  'errors': typeof ErrorsDict;
  'pet-forms': typeof PetFormsDict;
};
export type Namespace = keyof NamespaceMap;

async function fetchDictionary<T extends Namespace>(
  locale: SupportedLocale = 'en',
  namespace: T,
) {
  'use server';
  const localeFiles = import.meta.glob('./locales/*/*.json', {
    import: 'default',
  });
  const routeModuleDict = (await localeFiles[
    `./locales/${locale}/${namespace}.json`
  ]()) as NamespaceMap[T];
  return routeModuleDict;
}

export const getDictionary = async <T extends Namespace>(namespace: T) => {
  'use server';
  const event = getRequestEvent();
  const { locale } = event!.locals;
  return fetchDictionary(
    (locale as Intl.Locale).language as SupportedLocale,
    namespace,
  );
};

export const getDictionaryCached = cache(getDictionary, 'translations');

export const createTranslator = <T extends Namespace>(namespace: T) => {
  const dict = createAsync(() => getDictionaryCached(namespace));
  return translator(dict, resolveTemplate);
};

export const getLocale = cache(() => {
  'use server';
  const event = getRequestEvent();
  return (event!.locals.locale as Intl.Locale).baseName;
}, 'locale');

/**
 * Renders translations strings that might include HTML.
 * Uses innerHTML, so the validation of the tags should happen when accepting translations.
 */
export function T(props: ParentProps): JSX.Element {
  // eslint-disable-next-line solid/no-innerhtml
  return <span innerHTML={`${props.children}`} class="contents" />;
}
