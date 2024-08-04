import { Toaster } from "@nou/ui";
import type { RouteDefinition, RouteSectionProps } from "@solidjs/router";

import { cacheTranslations, createTranslator } from "~/server/i18n";

export const route = {
	async preload() {
		void cacheTranslations("app");
	},
} satisfies RouteDefinition;

function MainAppLayout(props: RouteSectionProps) {
	const t = createTranslator("app");
	return (
		<>
			{props.children}
			<Toaster label={t("notifications-region")!} />
		</>
	);
}

export default MainAppLayout;
