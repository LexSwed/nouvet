import { resolveTemplate, translator } from "@solid-primitives/i18n";
import { cache, createAsync } from "@solidjs/router";
import type { JSX, ParentProps } from "solid-js";
import { getRequestEvent, isServer } from "solid-js/web";

import { getDictionary } from "./dict";
import type { Namespace, NamespaceMap } from "./dict";

export const cacheTranslations = cache(<T extends Namespace>(namespace: T) => {
	"use server";
	return getDictionary(namespace);
}, "translations");

/**
 * For client side JS, we don't want to call `cache` again as it's not configurable and might be "expired" by the time it's called agai
 * when rendering the dynamic parts of the app.
 * Hence, store all translations used during initial load on the client, as they don't have to be reactive.
 * TODO: look at public HTTP caching, revalidating the translations when the content (bundle) changes.
 */
const clientMap = new Map<Namespace, NamespaceMap[Namespace]>();
export const createTranslator = <T extends Namespace>(namespace: T) => {
	const dict = createAsync(
		async () => {
			if (!isServer && clientMap?.has(namespace)) {
				return clientMap.get(namespace) as NamespaceMap[T];
			}
			const dict = await cacheTranslations(namespace);
			if (!isServer) {
				clientMap.set(namespace, dict);
			}
			return dict;
		},
		{ deferStream: true },
	);
	return translator(dict, resolveTemplate);
};

export const getLocale = cache(async () => {
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
