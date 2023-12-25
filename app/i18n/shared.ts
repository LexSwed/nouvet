import type { InitOptions } from "i18next";

export const acceptedLocales = ["en-US", "en-GB", "en", "es-ES", "es-MX", "es"];

export default {
	// This is the list of languages your application supports
	supportedLngs: acceptedLocales,
	// This is the language you want to use in case
	// if the user language is not in the supportedLngs
	fallbackLng: "en",
	// The default namespace of i18next is "translation", but you can customize it here
	defaultNS: "common",
	load: "languageOnly",
	// Disabling suspense is recommended
	react: { useSuspense: false },
	keySeparator: false,
} satisfies InitOptions;
