import { Avatar, ButtonLink, Card, Icon, Text } from "@nou/ui";
import { Title } from "@solidjs/meta";
import { type RouteDefinition, type RouteSectionProps, createAsync } from "@solidjs/router";
import { Match, Show, Switch } from "solid-js";

import { AppHeader } from "~/lib/app-header";
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
	const appT = createTranslator("app");
	const t = createTranslator("pets");
	const profile = createAsync(() => getUserProfile());
	const pet = createAsync(() => getPet(props.params.petId!));
	return (
		<>
			<Title>{t("meta.title", { petName: pet()?.name ?? "" })}</Title>
			<AppHeader>
				<ButtonLink href={"/app/pets"} variant="tonal">
					<Icon use="chevron-left" class="-ms-2" />
					<Text with="body-sm">{t("header.all-pets")}</Text>
				</ButtonLink>
			</AppHeader>
			<div class="container">
				<Show when={pet()}>
					{(pet) => (
						<Show when={profile()}>
							{(profile) => (
								<div class="flex flex-col gap-8">
									<Card variant="flat">
										<div class="flex flex-row gap-4">
											<div class="flex flex-col gap-4">
												<Text with="headline-2" as="h2">
													{pet()?.name}
												</Text>
												<PetPicture pet={pet()} />
											</div>
											<div class="ms-auto mt-auto flex h-10 flex-row items-center justify-between gap-4">
												<Switch>
													<Match when={profile().id === pet().owner?.id}>
														<ButtonLink
															size="sm"
															href={`/app/pets/${pet().id}/edit`}
															variant="tonal"
															state={{ previous: props.location.pathname }}
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
															state={{ previous: props.location.pathname }}
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

export default PetPage;
