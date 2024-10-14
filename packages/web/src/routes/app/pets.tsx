import { ButtonLink, Icon, Text } from "@nou/ui";
import { Title } from "@solidjs/meta";
import {
	type RouteDefinition,
	type RouteSectionProps,
	createAsync,
	useMatch,
} from "@solidjs/router";
import { Match, Switch } from "solid-js";

import { AppHeader } from "~/lib/app-header";
import { getPet } from "~/server/api/pet";
import { getUserFamily } from "~/server/api/user";
import { cacheTranslations, createTranslator } from "~/server/i18n";
import type { PetID } from "~/server/types";

export const route = {
	preload({ params }) {
		void cacheTranslations("pets");
		void getUserFamily();
		if (params.petId) {
			void getPet(params.petId as PetID);
		}
	},
} satisfies RouteDefinition;

const PetPage = (props: RouteSectionProps) => {
	const t = createTranslator("pets");
	const match = useMatch(() => "/app/pets/:petId/edit");
	const pet = createAsync(async () =>
		props.params.petId ? getPet(props.params.petId as PetID) : null,
	);
	return (
		<>
			<Title>{t("meta.title")}</Title>
			<AppHeader backLink="/app">
				<Switch>
					<Match when={match()}>
						<ButtonLink href={`/app/pets/${props.params.petId}`} variant="tonal">
							<Icon use="chevron-left" class="-ms-2" />
							<Text with="body-sm">
								{t("header.back-to-pet", { petName: pet()?.name as string })}
							</Text>
						</ButtonLink>
					</Match>
				</Switch>
			</AppHeader>
			{props.children}
		</>
	);
};

export default PetPage;
