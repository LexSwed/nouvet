import { Avatar, Button, ButtonLink, Card, Icon, Text } from "@nou/ui";
import { Title } from "@solidjs/meta";
import {
	type RouteDefinition,
	type RouteSectionProps,
	createAsync,
	useLocation,
} from "@solidjs/router";
import {
	type Accessor,
	type ComponentProps,
	Match,
	Show,
	Suspense,
	Switch,
	createSignal,
} from "solid-js";
import { NewActivityCreator } from "~/lib/new-activity-creator";
import { ActivitySelection } from "~/lib/new-activity-creator/new-activity-creator";
import { PetPicture } from "~/lib/pet-home-card";
import { getPetScheduledActivities, listAllPetActivities } from "~/server/api/activity";
import { getPet } from "~/server/api/pet";
import { getUser, getUserProfile } from "~/server/api/user";
import { cacheTranslations, createTranslator } from "~/server/i18n";
import type { ActivityType, PetID, UserSession } from "~/server/types";
import { PetPastActivities } from "./_lib/past-activities";
import { PetPrescriptions, type PrescriptionActivity } from "./_lib/pet-prescriptions";

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
	const user = createAsync(() => getUser());
	const scheduledActivities = createAsync(() =>
		getPetScheduledActivities(props.params.petId as PetID),
	);
	const activities = createAsync(() => listAllPetActivities(props.params.petId as PetID));
	const activityCreatorId = "pet-create-activity";
	const [defaultActivityType, setDefaultActivityType] =
		createSignal<ComponentProps<typeof NewActivityCreator>["defaultType"]>("type-select");
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
					<Show when={user()}>
						{(user) => (
							<>
								<Button variant="tonal" tone="primary" popoverTarget={activityCreatorId}>
									<Icon use="stack-plus" />
									{t("new-activity.create")}
								</Button>
								{/* TODO: No activities Empty state */}
								<Show
									when={(scheduledActivities() ?? []).length > 0 ? scheduledActivities() : null}
								>
									{(scheduledActivities) => (
										<PetScheduledActivities scheduledActivities={scheduledActivities} user={user} />
									)}
								</Show>
								<Show
									when={
										activities() && (activities()!.activities || []).length > 0
											? activities()
											: null
									}
									fallback={
										<EmptyActivities
											activityCreatorId={activityCreatorId}
											onClick={setDefaultActivityType}
										/>
									}
								>
									{(activities) => <PetPastActivities activities={activities} />}
								</Show>
							</>
						)}
					</Show>
				</div>
			</div>
			<Suspense fallback={null}>
				<Show when={user()}>
					<NewActivityCreator
						id={activityCreatorId}
						petId={props.params.petId as PetID}
						locale={user()!.locale}
						defaultType={defaultActivityType()}
					/>
				</Show>
			</Suspense>
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

function PetScheduledActivities(props: {
	user: Accessor<UserSession>;
	scheduledActivities: Accessor<Awaited<ReturnType<typeof getPetScheduledActivities>>>;
}) {
	const prescriptions = () =>
		props
			.scheduledActivities()
			?.filter(
				(activity): activity is PrescriptionActivity =>
					activity.type === "prescription" && activity.prescription !== null,
			);

	return (
		<Show when={props.user() && prescriptions()}>
			{(prescriptions) => (
				<PetPrescriptions activities={prescriptions} locale={props.user()!.locale} />
			)}
		</Show>
	);
}

function EmptyActivities(props: {
	activityCreatorId: string;
	onClick: (type: ActivityType) => void;
}) {
	const t = createTranslator("pets");
	return (
		<Card as="section" class="flex flex-col gap-2 bg-main">
			<Text as="h2" with="headline-2" class="text-balance">
				{t("empty-activities.heading")}
			</Text>
			<ActivitySelection
				popoverTarget={props.activityCreatorId}
				update={(type) => {
					// @ts-expect-error
					props.onClick(type);
				}}
			/>
		</Card>
	);
}

export default PetPage;
