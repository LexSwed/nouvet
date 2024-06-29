import type { RouteDefinition } from "@solidjs/router";

import { getUserPets } from "~/server/api/pet";
import { getUserFamily } from "~/server/api/user";
import { cacheTranslations } from "~/server/i18n";

export const route = {
	load() {
		return Promise.all([cacheTranslations("app"), getUserPets(), getUserFamily()]);
	},
} satisfies RouteDefinition;

const PetPage = () => {
	return <section class="container flex flex-col gap-8">Hello world</section>;
};

export default PetPage;
