import Backend from "i18next-fs-backend";
import { resolve } from "node:path";
import { RemixI18Next } from "remix-i18next";
import sharedConfig from "./shared.ts";

let i18next = new RemixI18Next({
	detection: {
		supportedLanguages: sharedConfig.supportedLngs,
		fallbackLanguage: sharedConfig.fallbackLng,
	},
	// This is the configuration for i18next used
	// when translating messages server-side only
	i18next: {
		...sharedConfig,
		backend: {
			loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json"),
		},
	},
	plugins: [Backend],
});

export default i18next;
