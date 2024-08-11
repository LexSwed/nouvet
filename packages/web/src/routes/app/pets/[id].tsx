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
			<Title>{t("meta.title", { petName: "Calala" })}</Title>
			<AppHeader backLink="/app/pets" />
			<div class="container min-h-full">Hello</div>
		</>
	);
};

export default PetPage;
