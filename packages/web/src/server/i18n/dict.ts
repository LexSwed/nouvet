'use server';

import { getRequestEvent } from 'solid-js/web';

import type AppDict from './locales/en/app';
import type ErrorsDict from './locales/en/errors';
import type FamilyDict from './locales/en/family';
import type InvitedDict from './locales/en/invited';
import type LoginDict from './locales/en/login';
import type PetFormsDict from './locales/en/pet-forms';
import type WWWDict from './locales/en/www';
import type { SupportedLocale } from './shared';

export type NamespaceMap = {
  'www': typeof WWWDict;
  'app': typeof AppDict;
  'family': typeof FamilyDict;
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
  const localeFiles = import.meta.glob('./locales/*/*.ts', {
    import: 'default',
  });
  const routeModuleDict = (await localeFiles[
    `./locales/${locale}/${namespace}.ts`
  ]()) as NamespaceMap[T];
  return routeModuleDict;
}

export const getDictionary = async <T extends Namespace>(namespace: T) => {
  const event = getRequestEvent();
  const { locale } = event!.locals;
  // TODO: check if HMR in AsyncLocalContext is fixed to remove optional chaining
  return await fetchDictionary(locale?.language as SupportedLocale, namespace);
};
