import { ButtonLink, Icon, Text } from "@nou/ui";
import { Title } from "@solidjs/meta";
import {
	type RouteDefinition,
	type RouteSectionProps,
	createAsync,
	useMatch,
} from "@solidjs/router";
import { Show } from "solid-js";

import { AppHeader } from "~/lib/app-header";
import { getPet } from "~/server/api/pet";
import { getUserFamily } from "~/server/api/user";
import { cacheTranslations, createTranslator } from "~/server/i18n";

export const route = {
	preload({ params }) {
		void cacheTranslations("pets");
		void getUserFamily();
		if (params.petId) {
			void getPet(params.petId!);
		}
	},
} satisfies RouteDefinition;

const PetPage = (props: RouteSectionProps) => {
	const t = createTranslator("pets");
	const match = useMatch(() => "/app/pets/:petId/edit");
	const pet = createAsync(async () => (props.params.petId ? getPet(props.params.petId) : null));
	return (
		<>
			<Title>{t("meta.title")}</Title>
			<AppHeader backLink="/app">
				<Show when={match()}>
					<ButtonLink href={`/app/pets/${props.params.petId}`} variant="tonal">
						<Icon use="chevron-left" class="-ms-2" />
						<Text with="body-sm">{pet()?.name}</Text>
					</ButtonLink>
				</Show>
			</AppHeader>
			{props.children}
		</>
	);
};

export default PetPage;
