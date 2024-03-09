import { resolveTemplate, translator } from '@solid-primitives/i18n';
import { cache, createAsync } from '@solidjs/router';
import type { JSX, ParentProps } from 'solid-js';
import { getRequestEvent } from 'solid-js/web';

import { getDictionary } from './dict';
import type { Namespace } from './dict';

export const cacheTranslations = cache(getDictionary, 'translations');

export const createTranslator = <T extends Namespace>(namespace: T) => {
  const dict = createAsync(() => cacheTranslations(namespace));
  return translator(dict, resolveTemplate);
};

export const getLocale = cache(async () => {
  'use server';
  const event = getRequestEvent();
  const { locale } = event!.locals;
  return {
    /** A string containing the language, and the script and region if available. */
    baseName: locale.baseName,
    /** The primary language subtag associated with the locale. */
    language: locale.language,
    /** The region of the world (usually a country) associated with the locale. Possible values are region codes as defined by ISO 3166-1. */
    region: locale.region,
  };
}, 'locale');

/**
 * Renders translations strings that might include HTML.
 * Uses innerHTML, so the validation of the tags should happen when accepting translations.
 */
export function T(props: ParentProps): JSX.Element {
  // eslint-disable-next-line solid/no-innerhtml
  return <span innerHTML={`${props.children}`} class="contents" />;
}
