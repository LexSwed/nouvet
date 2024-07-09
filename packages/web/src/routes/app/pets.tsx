import type { RouteDefinition, RouteSectionProps } from "@solidjs/router";
import { Suspense } from "solid-js";

import { AppHeader } from "~/lib/app-header";

export const route = {
	preload() {},
} satisfies RouteDefinition;

const PetPage = (props: RouteSectionProps) => {
	return (
		<div class="min-h-full bg-background">
			<AppHeader>Go back?</AppHeader>
			<Suspense>{props.children}</Suspense>
		</div>
	);
};

export default PetPage;
