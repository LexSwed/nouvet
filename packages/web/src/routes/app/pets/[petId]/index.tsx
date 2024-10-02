import { Avatar, Button, ButtonLink, Card, Icon, Text } from "@nou/ui";
import { createVisibilityObserver } from "@solid-primitives/intersection-observer";
import { Title } from "@solidjs/meta";
import {
	type RouteDefinition,
	type RouteSectionProps,
	createAsync,
	useLocation,
} from "@solidjs/router";
import {
	type Accessor,
	For,
	Match,
	Show,
	Suspense,
	Switch,
	createEffect,
	createSignal,
} from "solid-js";
import { createStore } from "solid-js/store";
import { NewActivityCreator } from "~/lib/new-activity-creator";
import { PetPicture } from "~/lib/pet-home-card";
import { listAllPetActivities } from "~/server/api/activity";
import { getPet } from "~/server/api/pet";
import { getUser, getUserProfile } from "~/server/api/user";
import { cacheTranslations, createTranslator } from "~/server/i18n";
import type { PetActivitiesPaginationCursor, PetID } from "~/server/types";

export const route = {
	preload({ params }) {
		void cacheTranslations("pets");
		void getPet(params.petId as PetID);
		void getUserProfile();
		void getUser();
	},
} satisfies RouteDefinition;

const PetPage = (props: RouteSectionProps) => {
	const t = createTranslator("pets");
	const profile = createAsync(() => getUserProfile());
	const pet = createAsync(() => getPet(props.params.petId as PetID));
	return (
		<>
			<Title>{t("meta.title", { petName: pet()?.name ?? "" })}</Title>
			<div class="container">
				<div class="flex flex-col gap-6">
					<Show when={pet()}>
						{(pet) => (
							<Show when={profile()}>
								{(profile) => <MainPetCard pet={pet} profile={profile} />}
							</Show>
						)}
					</Show>
					<PastPetActivities petId={props.params.petId as PetID} />
				</div>
			</div>
		</>
	);
};

function MainPetCard(props: {
	pet: Accessor<NonNullable<Awaited<ReturnType<typeof getPet>>>>;
	profile: Accessor<NonNullable<Awaited<ReturnType<typeof getUserProfile>>>>;
}) {
	const { pet, profile } = props;
	const appT = createTranslator("app");
	const t = createTranslator("pets");
	const location = useLocation();

	return (
		<div class="flex flex-col gap-4">
			<div class="flex flex-row items-center justify-between gap-4">
				<Text with="headline-1" as="h1">
					{pet().name}
				</Text>
				<div class="flex h-10 flex-row items-center justify-between gap-4">
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
			<PetPicture pet={pet()} class="size-24 rounded-3xl" />
		</div>
	);
}

function PastPetActivities(props: { petId: PetID }) {
	// TODO: cursor pagination
	const [cursor, setCursor] = createSignal<null | PetActivitiesPaginationCursor>(null);
	const activities = createAsync(() => listAllPetActivities(props.petId, cursor()));
	const [allActivities, setAllActivities] = createStore({ activities: activities()?.activities });

	const [latestElement, setLatestElement] = createSignal<HTMLElement>();

	const useVisibilityObserver = createVisibilityObserver({ threshold: 0.5 });

	const visible = useVisibilityObserver(latestElement);

	createEffect(() => {
		console.log(visible(), latestElement());
		console.log(cursor(), activities.latest?.cursor, activities()?.cursor);
		if (visible() && !cursor() && activities.latest?.cursor) {
			setCursor(activities.latest?.cursor);
		}
	});

	createEffect(() => {
		const newActivities = activities()?.activities;
		if (newActivities) {
			setAllActivities("activities", newActivities);
		}
	});

	return (
		<Show when={allActivities.activities && Object.entries(allActivities.activities)}>
			{(activitiesEntries) => {
				const lastDateIndex = activitiesEntries().length - 1;
				return (
					<Card class="flex flex-col gap-6" aria-labelledby="pet-activities-headline">
						<ActivityQuickCreator petId={props.petId} />
						<Text as="h3" with="headline-3" id="pet-activities-headline">
							Past activities
						</Text>
						<ul class="grid grid-cols-[auto,1fr] gap-6">
							<For each={activitiesEntries()}>
								{([date, activities], i) => {
									const isLastDate = i() === lastDateIndex;
									return (
										<li class="contents">
											<Text with="overline">{date}</Text>
											<ul
												class="flex flex-1 flex-col gap-6 rounded-2xl bg-tertiary/5 p-3"
												ref={isLastDate ? setLatestElement : undefined}
											>
												<For each={activities}>
													{(activity) => (
														<li class="flex flex-row items-center gap-2">
															<Icon
																use="note"
																class="size-10 rounded-full bg-yellow-100 p-2 text-yellow-950"
															/>
															<div class="flex flex-1 flex-col gap-2">
																<div class="flex flex-row items-center justify-between gap-4">
																	<Text with="body-xs">{activity.type}</Text>
																	<Text with="body-xs" tone="light">
																		{activity.time}
																	</Text>
																</div>
															</div>
														</li>
													)}
												</For>
											</ul>
										</li>
									);
								}}
							</For>
						</ul>
					</Card>
				);
			}}
		</Show>
	);
}

function ActivityQuickCreator(props: { petId: PetID }) {
	const t = createTranslator("pets");
	const user = createAsync(() => getUser());

	return (
		<>
			<Button variant="tonal" tone="primary" popoverTarget="create-activity">
				<Icon use="stack-plus" />
				{t("new-activity.create")}
			</Button>
			<Suspense fallback={null}>
				<Show when={user()}>
					<NewActivityCreator petId={props.petId} locale={user()!.locale} />
				</Show>
			</Suspense>
		</>
	);
}

export default PetPage;
