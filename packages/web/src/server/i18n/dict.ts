"use server";

import { getRequestEvent } from "solid-js/web";

import type AppDict from "./locales/en/app";
import type ErrorsDict from "./locales/en/errors";
import type FamilyDict from "./locales/en/family";
import type InvitedDict from "./locales/en/invited";
import type LoginDict from "./locales/en/login";
import type PetsDict from "./locales/en/pets";
import type ProfileDict from "./locales/en/profile";
import type WWWDict from "./locales/en/www";
import type { SupportedLocale } from "./shared";

export interface NamespaceMap {
	www: typeof WWWDict;
	app: typeof AppDict;
	family: typeof FamilyDict;
	login: typeof LoginDict;
	invited: typeof InvitedDict;
	errors: typeof ErrorsDict;
	pets: typeof PetsDict;
	profile: typeof ProfileDict;
}
export type Namespace = keyof NamespaceMap;

type LocaleLanguage = SupportedLocale extends `${infer Language}-${string}` ? Language : never;

async function fetchDictionary<T extends Namespace>(locale: LocaleLanguage, namespace: T) {
	const localeFiles = import.meta.glob("./locales/*/*.ts", {
		import: "default",
	});
	const routeModuleDict = (await localeFiles[
		`./locales/${locale}/${namespace}.ts`
	]?.()) as NamespaceMap[T];
	return routeModuleDict;
}

export const getDictionary = async <T extends Namespace>(namespace: T) => {
	const event = getRequestEvent();
	const locale = event!.locals.locale;
	return await fetchDictionary(locale.language as LocaleLanguage, namespace);
};
