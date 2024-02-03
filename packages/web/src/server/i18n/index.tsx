import { prefix, resolveTemplate, translator } from '@solid-primitives/i18n';
import { cache, createAsync } from '@solidjs/router';
import { type JSX, type ParentProps } from 'solid-js';
import { getRequestEvent } from 'solid-js/web';

import type AppDict from './locales/en/app.json';
import type CommonDict from './locales/en/common.json';
import type ErrorsDict from './locales/en/errors.json';
import type LoginDict from './locales/en/login.json';
import type PetFormsDict from './locales/en/pet-forms.json';
import type WWWDict from './locales/en/www.json';

export type Locale = (typeof acceptedLocaleLanguageTag)[number];

type NamespaceMap = {
  'common': typeof CommonDict;
  'www': typeof WWWDict;
  'app': typeof AppDict;
  'login': typeof LoginDict;
  'errors': typeof ErrorsDict;
  'pet-form': typeof PetFormsDict;
};
type Namespace = keyof NamespaceMap;

export const acceptedLocaleLanguageTag = ['en', 'es'] as const satisfies Array<
  Intl.Locale['language']
>;

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

export const getDictionary = async <T extends Namespace>(namespace: T) => {
  'use server';
  const event = getRequestEvent();
  const { locale } = event!.locals;
  if (!locale) {
    console.error('Probably HMR, defaulting to en');
    return fetchDictionary('en', namespace);
  }
  return fetchDictionary((locale as Intl.Locale).language as Locale, namespace);
};

export const getDictionaryCached = cache(getDictionary, 'translations');

export const createTranslator = <T extends Namespace>(namespace: T) => {
  const dict = createAsync(() => getDictionaryCached(namespace));
  return translator(dict, resolveTemplate);
};

const getLocale = cache(async () => {
  'use server';
  const event = getRequestEvent();
  return (event!.locals.locale as Intl.Locale).baseName;
}, 'locale');

export const userLocale = () => {
  const lang = createAsync(() => getLocale());
  return lang;
};

/**
 * Renders translations strings that might include HTML.
 * Uses innerHTML, so the validation of the tags should happen when accepting translations.
 */
export function T(props: ParentProps): JSX.Element {
  // eslint-disable-next-line solid/no-innerhtml
  return <span innerHTML={`${props.children}`} class="contents" />;
}
