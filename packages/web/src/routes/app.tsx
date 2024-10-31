import { Toaster } from "@nou/ui";
import type { RouteDefinition, RouteSectionProps } from "@solidjs/router";

import { createTranslator, queryDictionary } from "~/server/i18n";

export const route = {
	async preload() {
		void queryDictionary("app");
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
