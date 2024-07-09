import type { RouteDefinition, RouteSectionProps } from "@solidjs/router";

import { cacheTranslations } from "~/server/i18n";

export const route = {
	async preload() {
		void cacheTranslations("app");
	},
} satisfies RouteDefinition;

function MainAppLayout(props: RouteSectionProps) {
	return <>{props.children}</>;
}

export default MainAppLayout;
