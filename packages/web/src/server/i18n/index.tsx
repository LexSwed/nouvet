import { resolveTemplate, translator } from "@solid-primitives/i18n";
import { createAsync, query } from "@solidjs/router";
import type { JSX, ParentProps } from "solid-js";
import { getRequestEvent } from "solid-js/web";

import { getDictionary } from "./dict";
import type { Namespace, NamespaceMap } from "./dict";

export const queryDictionary = query(async <T extends Namespace>(namespace: T) => {
	"use server";
	return getDictionary(namespace);
	// 1 hour browser cache
	// return json(await getDictionary(namespace), {
	// 	headers: { "Cache-Control": "public, max-age=3600" },
	// });
}, "translations");

/**
 *
 * TODO: look at public HTTP caching, revalidating the translations when the content (bundle) changes.
 * Otherwise, if parts of UI are rendered lazily (modals, dialogs), the translations might be loaded multiple times,
 * Revalidation is required to ensure no new deployed code is relying on translations that aren't available due to caching.
 */
export const createTranslator = <T extends Namespace>(namespace: T) => {
	const dict = createAsync(() => queryDictionary(namespace) as Promise<NamespaceMap[T]>, {
		name: `t-${namespace}`,
		deferStream: true,
	});
	return translator(dict, resolveTemplate);
};

export const getLocale = query(async () => {
	"use server";
	const event = getRequestEvent();
	const locale = event?.locals.locale;
	return {
		/** A string containing the language, and the script and region if available. */
		baseName: locale!.baseName,
		/** The primary language subtag associated with the locale. */
		language: locale!.language,
		/** The region of the world (usually a country) associated with the locale. Possible values are region codes as defined by ISO 3166-1. */
		region: locale!.region,
	};
}, "locale");

/**
 * Renders translations strings that might include HTML.
 * Uses innerHTML, so the validation of the tags should happen when accepting translations.
 */
export function T(props: ParentProps): JSX.Element {
	return <span innerHTML={`${props.children}`} class="contents" />;
}
