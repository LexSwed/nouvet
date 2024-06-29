export const acceptedLocaleLanguageTag = ["en", "es"] as const satisfies Array<
	Intl.Locale["language"]
>;

export type SupportedLocale = (typeof acceptedLocaleLanguageTag)[number];
