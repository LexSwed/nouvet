'use server';

import { getRequestEvent } from 'solid-js/web';

import type AppDict from './locales/en/app.json';
import type CommonDict from './locales/en/common.json';
import type ErrorsDict from './locales/en/errors.json';
import type InvitedDict from './locales/en/invited.json';
import type LoginDict from './locales/en/login.json';
import type PetFormsDict from './locales/en/pet-forms.json';
import type WWWDict from './locales/en/www.json';
import type { SupportedLocale } from './shared';

export type NamespaceMap = {
  'common': typeof CommonDict;
  'www': typeof WWWDict;
  'app': typeof AppDict;
  'login': typeof LoginDict;
  'invited': typeof InvitedDict;
  'errors': typeof ErrorsDict;
  'pet-forms': typeof PetFormsDict;
};
export type Namespace = keyof NamespaceMap;

async function fetchDictionary<T extends Namespace>(
  locale: SupportedLocale = 'en',
  namespace: T,
) {
  const localeFiles = import.meta.glob('./locales/*/*.json', {
    import: 'default',
  });
  const routeModuleDict = (await localeFiles[
    `./locales/${locale}/${namespace}.json`
  ]()) as NamespaceMap[T];
  return routeModuleDict;
}

export const getDictionary = async <T extends Namespace>(namespace: T) => {
  const event = getRequestEvent();
  const { locale } = event!.locals;
  return await fetchDictionary(locale.language as SupportedLocale, namespace);
};
