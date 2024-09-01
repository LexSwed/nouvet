export const acceptedLocaleLanguageTag = [
	"en-US",
	"en-GB",
	"es-ES",
	"es-MX",
] as const satisfies Array<Intl.Locale["language"]>;

export type SupportedLocale = (typeof acceptedLocaleLanguageTag)[number];
