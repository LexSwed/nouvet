import { Avatar, ButtonLink, Card, Icon, Text } from "@nou/ui";
import { Title } from "@solidjs/meta";
import {
	type RouteDefinition,
	type RouteSectionProps,
	createAsync,
	useLocation,
} from "@solidjs/router";
import { type Accessor, Match, Show, Switch } from "solid-js";
import { PetPicture } from "~/lib/pet-home-card";
import { getPet } from "~/server/api/pet";
import { getUserProfile } from "~/server/api/user";
import { cacheTranslations, createTranslator } from "~/server/i18n";

export const route = {
	preload({ params }) {
		void cacheTranslations("pets");
		void getPet(params.petId!);
		void getUserProfile();
	},
} satisfies RouteDefinition;

const PetPage = (props: RouteSectionProps) => {
	const t = createTranslator("pets");
	const profile = createAsync(() => getUserProfile());
	const pet = createAsync(() => getPet(props.params.petId!));
	return (
		<>
			<Title>{t("meta.title", { petName: pet()?.name ?? "" })}</Title>
			<div class="container">
				<Show when={pet()}>
					{(pet) => (
						<Show when={profile()}>
							{(profile) => (
								<div class="flex flex-col gap-8">
									<MainPetCard pet={pet} profile={profile} />
									<Card variant="tonal" tone="primary">
										More
									</Card>
								</div>
							)}
						</Show>
					)}
				</Show>
			</div>
		</>
	);
};

function MainPetCard(props: {
	pet: Accessor<Awaited<ReturnType<typeof getPet>>>;
	profile: Accessor<Awaited<ReturnType<typeof getUserProfile>>>;
}) {
	const { pet, profile } = props;
	const appT = createTranslator("app");
	const t = createTranslator("pets");
	const location = useLocation();

	return (
		<Card variant="flat">
			<div class="flex flex-col gap-4">
				<div class="flex flex-row items-center gap-4">
					<PetPicture pet={pet()} />
					<Text with="headline-2" as="h2">
						{pet()?.name}
					</Text>
				</div>
				<div class="ms-auto mt-auto flex h-10 flex-row items-center justify-between gap-4">
					<Switch>
						<Match when={profile().id === pet().owner?.id}>
							<ButtonLink
								size="sm"
								href={`/app/pets/${pet().id}/edit`}
								variant="tonal"
								state={{ previous: location.pathname }}
							>
								<Text>{t("pet-card.edit")}</Text>
								<Icon use="pencil" size="sm" />
							</ButtonLink>
						</Match>
						<Match when={profile().id !== pet().owner?.id}>
							<ButtonLink
								size="sm"
								href={`/app/family/${pet().owner!.id}`}
								variant="tonal"
								state={{ previous: location.pathname }}
							>
								<Avatar
									avatarUrl={pet().owner!.avatarUrl || ""}
									name={pet().owner!.name || ""}
									size="xs"
								/>
								<Text>{pet().owner!.name || appT("pet-owner-no-name")}</Text>
							</ButtonLink>
						</Match>
					</Switch>
				</div>
			</div>
		</Card>
	);
}

export default PetPage;
