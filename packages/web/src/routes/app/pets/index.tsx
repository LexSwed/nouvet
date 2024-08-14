import { Title } from "@solidjs/meta";
import type { RouteDefinition } from "@solidjs/router";

import { AppHeader } from "~/lib/app-header";
import { cacheTranslations, createTranslator } from "~/server/i18n";

export const route = {
	preload() {
		void cacheTranslations("pets");
	},
} satisfies RouteDefinition;

const PetPage = () => {
	const t = createTranslator("pets");
	return (
		<>
			<Title>{t("meta.title")}</Title>
			<AppHeader backLink="/app" />
			<div class="container">Hello pets</div>
		</>
	);
};

export default PetPage;
