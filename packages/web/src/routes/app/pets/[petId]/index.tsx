import { Avatar, Button, ButtonLink, Card, Icon, Text } from "@nou/ui";
import { Title } from "@solidjs/meta";
import {
	type RouteDefinition,
	type RouteSectionProps,
	createAsync,
	useLocation,
} from "@solidjs/router";
import { type Accessor, For, Match, Show, Suspense, Switch } from "solid-js";
import { Temporal } from "temporal-polyfill";
import { NewActivityCreator } from "~/lib/new-activity-creator";
import { PetPicture } from "~/lib/pet-home-card";
import { createFormattedDate } from "~/lib/utils/format-date";
import { getPetScheduledActivities, listAllPetActivities } from "~/server/api/activity";
import { getPet } from "~/server/api/pet";
import { getUser, getUserProfile } from "~/server/api/user";
import { cacheTranslations, createTranslator } from "~/server/i18n";
import type { PetID } from "~/server/types";

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
					<ActivityQuickCreator petId={props.params.petId as PetID} />
					<PetScheduledActivities petId={props.params.petId as PetID} />
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

function PetScheduledActivities(props: { petId: PetID }) {
	const t = createTranslator("pets");
	const user = createAsync(() => getUser());
	const activities = createAsync(() => getPetScheduledActivities(props.petId));

	const prescriptions = () =>
		activities()?.filter(
			(
				activity,
			): activity is typeof activity & {
				type: "prescription";
				prescription: NonNullable<(typeof activity)["prescription"]>;
			} => activity.type === "prescription" && activity.prescription !== null,
		);

	return (
		<Show when={user() && prescriptions()}>
			{(prescriptions) => (
				<ul class="flex flex-row items-stretch gap-2">
					<For each={prescriptions()}>
						{(activity) => (
							<Card
								as="li"
								variant="tonal"
								tone="secondary"
								class="flex w-[max-content] flex-col gap-3"
							>
								<div class="flex flex-row items-center gap-2">
									<Show when={activity.prescription.endDate}>
										{(utc) => {
											const endDate = Temporal.PlainDate.from(utc());
											const now = Temporal.Now.plainDateISO();
											const diff = now.until(endDate, {
												smallestUnit: "day",
												largestUnit: "year",
											});
											const formatter = new Intl.RelativeTimeFormat(user()!.locale, {});
											if (diff.years > 0) {
												return (
													<Text
														with="overline"
														as="time"
														datetime={utc()}
														title={endDate.toLocaleString()}
													>
														{formatter.format(diff.years, "years")}
													</Text>
												);
											}
											if (diff.months > 0) {
												return (
													<Text
														with="overline"
														as="time"
														datetime={utc()}
														title={endDate.toLocaleString()}
													>
														{formatter.format(diff.months, "months")}
													</Text>
												);
											}
											if (diff.days > 0) {
												return (
													<Text
														with="overline"
														as="time"
														datetime={utc()}
														title={endDate.toLocaleString()}
													>
														{formatter.format(diff.days, "days")}
													</Text>
												);
											}
											if (diff.days < 0) {
												const date = createFormattedDate(
													() => new Date(utc()),
													() => user()!.locale,
													{ hour: null },
												);
												return (
													<Text
														with="overline"
														as="time"
														datetime={utc()}
														title={endDate.toLocaleString()}
													>
														{date()}
													</Text>
												);
											}
										}}
									</Show>
									<Icon use="dot" size="md" class="ms-auto" />
								</div>
								<div class="flex flex-row items-center gap-2">
									<Icon use="pill" />
									{activity.prescription.name}
								</div>
							</Card>
						)}
					</For>
				</ul>
			)}
		</Show>
	);
}

function PastPetActivities(props: { petId: PetID }) {
	// TODO: cursor pagination
	const activities = createAsync(() => listAllPetActivities(props.petId));

	// TODO: empty results, cursor pagination, current date highlight

	return (
		<Show when={activities()?.activities}>
			{(yearActivities) => {
				return (
					<Card class="flex flex-col gap-6" aria-labelledby="pet-activities-headline">
						<ActivityQuickCreator petId={props.petId} />
						<Text as="h3" with="headline-3" id="pet-activities-headline">
							Past activities
						</Text>
						<div class="grid grid-cols-[auto,1fr] gap-4">
							<For each={yearActivities()}>
								{([year, dateEntries]) => (
									<section class="contents">
										<header class="col-span-2">
											<Text
												with="overline"
												tone="light"
												class="rounded-md bg-on-surface/3 p-1 tabular-nums"
											>
												{year}
											</Text>
										</header>
										<ul class="contents">
											<For each={dateEntries}>
												{([date, activities]) => {
													return (
														<li class="contents">
															<Text with="overline" class="sticky top-2 text-end tabular-nums">
																{date}
															</Text>
															<ul class="flex flex-1 flex-col gap-6 rounded-2xl bg-tertiary/5 p-3">
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
									</section>
								)}
							</For>
						</div>
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
