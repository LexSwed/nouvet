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
	Toast,
	toast,
} from "@nou/ui";
import { Title } from "@solidjs/meta";
import {
	type RouteDefinition,
	type RouteSectionProps,
	createAsync,
	useAction,
	useLocation,
	useSubmission,
} from "@solidjs/router";
import { type Accessor, Match, Show, Switch } from "solid-js";
import { Temporal } from "temporal-polyfill";
import { PetPicture } from "~/lib/pet-home-card";
import { createFormattedDate } from "~/lib/utils/format-date";
import { pickSubmissionValidationErrors } from "~/lib/utils/submission";
import { createPetActivity } from "~/server/api/activity";
import { getPet } from "~/server/api/pet";
import { getUser, getUserProfile } from "~/server/api/user";
import type { ActivityType } from "~/server/db/schema";
import { cacheTranslations, createTranslator } from "~/server/i18n";

export const route = {
	preload({ params }) {
		void cacheTranslations("pets");
		void getPet(params.petId!);
		void getUserProfile();
		void getUser();
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
										<ActivityQuickCreator petId={pet().id} />
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

function ActivityQuickCreator(props: { petId: string }) {
	const t = createTranslator("pets");
	const submission = useSubmission(createPetActivity);
	const action = useAction(createPetActivity);
	const user = createAsync(() => getUser());

	const zoned = Temporal.Now.zonedDateTimeISO();

	const currentDateFormatted = createFormattedDate(
		() => new Date(zoned.epochMilliseconds),
		() => user()?.locale,
	);

	return (
		<>
			<Button variant="tonal" tone="primary" popoverTarget="create-activity">
				<Icon use="stack-plus" />
				{t("new-activity.create")}
			</Button>
			<Drawer id="create-activity" heading={t("new-activity.heading")}>
				<Form
					class="flex flex-col gap-3"
					validationErrors={pickSubmissionValidationErrors(submission)}
					onSubmit={async (e) => {
						e.preventDefault();
						const form = e.currentTarget;
						const formData = new FormData(form);
						const type = formData.get("activity-type");
						const res = await action(formData);
						if ("activity" in res) {
							// TODO: different text depending on saved activity type
							toast(() => <Toast heading={`The ${type} is saved!`} />);
							form.reset();
							document.getElementById("create-activity")?.hidePopover();
						} else if (res.failureReason === "other") {
							// TODO: different text depending on saved activity type
							toast(() => <Toast tone="failure" heading={"Failed to save the note"} />);
						}
					}}
				>
					<input type="hidden" name="petId" value={props.petId} />
					<Fieldset legend={<span class="sr-only">{t("new-activity.type-label")}</span>}>
						<div class="overflow-snap -mx-4 flex scroll-px-4 flex-row gap-2 px-4">
							<RadioCard
								name="activity-type"
								value={"observation" satisfies ActivityType}
								checked
								label={t("new-activity.type-observation")}
								icon={<Icon use="note" />}
								class="basis-[8.5rem] part-[label]:flex-col part-[label]:items-start will-change-[flex-basis] has-[input:checked]:basis-[9.25rem]"
							/>
							<RadioCard
								name="activity-type"
								value={"appointment" satisfies ActivityType}
								label={t("new-activity.type-appointment")}
								icon={<Icon use="first-aid" />}
								class="basis-[8.5rem] part-[label]:flex-col part-[label]:items-start will-change-[flex-basis] has-[input:checked]:basis-[9.25rem]"
							/>
							<RadioCard
								name="activity-type"
								value={"prescription" satisfies ActivityType}
								label={t("new-activity.type-prescription")}
								icon={<Icon use="pill" />}
								class="basis-[8.5rem] part-[label]:flex-col part-[label]:items-start will-change-[flex-basis] has-[input:checked]:basis-[9.25rem]"
							/>
							<RadioCard
								name="activity-type"
								value={"vaccination" satisfies ActivityType}
								label={t("new-activity.type-vaccination")}
								icon={<Icon use="syringe" />}
								class="basis-[8.5rem] part-[label]:flex-col part-[label]:items-start will-change-[flex-basis] has-[input:checked]:basis-[9.25rem]"
							/>
						</div>
					</Fieldset>
					<div class="flex flex-row justify-start">
						<Button variant="tonal" size="sm">
							<Text
								as="time"
								datetime={zoned.toString()}
								tone="light"
								class="flex flex-row items-center gap-2 font-light"
							>
								{currentDateFormatted()}
								<Icon use="pencil" size="xs" />
							</Text>
						</Button>
					</div>
					<TextField variant="ghost" type="datetime-local" name="date" label="Date" />
					<TextField
						as="textarea"
						name="note"
						label={t("new-activity.note-label")}
						description={t("new-activity.note-description")}
						placeholder={t("new-activity.note-placeholder")}
						variant="ghost"
						rows="2"
						maxLength={1000}
						class="part-[input]:max-h-[5lh]"
						onKeyDown={(e) => {
							if (e.key === "Enter" && e.metaKey) {
								e.preventDefault();
								e.currentTarget.form?.dispatchEvent(new Event("submit"));
							}
						}}
					/>
					<div class="mt-4 flex flex-row justify-end gap-4 *:flex-1">
						<Button variant="ghost" popoverTargetAction="hide" popoverTarget="create-activity">
							{t("new-activity.cta-cancel")}
						</Button>
						<Button type="submit" variant="tonal" tone="primary" pending={submission.pending}>
							{t("new-activity.cta-create")}
						</Button>
					</div>
				</Form>
			</Drawer>
		</>
	);
}

export default PetPage;
