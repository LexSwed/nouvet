import {
	Avatar,
	Button,
	ButtonLink,
	Card,
	Drawer,
	Fieldset,
	Form,
	Icon,
	RadioCard,
	Text,
	TextField,
} from "@nou/ui";
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
import type { ActivityType } from "~/server/db/schema";
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
									<div class="flex flex-row items-center gap-4">
										<ActivityQuickCreator />
									</div>
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

function ActivityQuickCreator() {
	const t = createTranslator("pets");

	return (
		<>
			<Button variant="tonal" tone="primary" popoverTarget="create-activity">
				<Icon use="stack-plus" />
				Create
			</Button>
			<Drawer id="create-activity" heading="New event">
				<Form class="flex flex-col gap-3">
					<Fieldset legend="Type of the event">
						<div class="overflow-snap -mx-4 flex scroll-px-4 flex-row gap-2 px-4">
							<RadioCard
								name="activity-type"
								value={"observation" satisfies ActivityType}
								checked
								label="Note"
								class="min-h-16 min-w-0 flex-1 shrink-0 basis-32"
							/>
							<RadioCard
								name="activity-type"
								value={"appointment" satisfies ActivityType}
								label="Appointment"
								class="min-h-16 min-w-0 flex-1 shrink-0 basis-32"
							/>
							<RadioCard
								name="activity-type"
								value={"medication" satisfies ActivityType}
								label="Medication"
								class="min-h-16 min-w-0 flex-1 shrink-0 basis-32"
							/>
							<RadioCard
								name="activity-type"
								value={"vaccination" satisfies ActivityType}
								label="Vaccination"
								class="min-h-16 min-w-0 flex-1 shrink-0 basis-32"
							/>
						</div>
					</Fieldset>
					{/* Type - start from Note */}
					<TextField
						as="textarea"
						name="note"
						label="Note"
						description="The observation you want to record"
						placeholder="What happened?"
						variant="ghost"
						rows="2"
					/>
					{/* <Fieldset legend="Date" name="event-date" class="flex flex-row gap-2">
						<TextField name="date" label="Date" autocomplete="off" type="date" class="flex-[3]" />
						<TextField name="time" label="Time" autocomplete="off" type="time" class="flex-[2]" />
					</Fieldset> */}
					<div class="mt-4 flex flex-row justify-end gap-4 *:flex-1">
						<Button variant="ghost" popoverTargetAction="hide" popoverTarget="create-activity">
							Cancel
						</Button>
						<Button type="submit" variant="tonal" tone="primary">
							Create
						</Button>
					</div>
				</Form>
			</Drawer>
		</>
	);
}

export default PetPage;
