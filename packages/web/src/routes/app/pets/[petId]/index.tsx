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
	startViewTransition,
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
import { type Accessor, For, Match, Show, Suspense, Switch, createSignal } from "solid-js";
import { Temporal } from "temporal-polyfill";
import { PetPicture } from "~/lib/pet-home-card";
import { createFormattedDate } from "~/lib/utils/format-date";
import { pickSubmissionValidationErrors } from "~/lib/utils/submission";
import { createPetActivity, getPetActivities } from "~/server/api/activity";
import { getPet } from "~/server/api/pet";
import { getUser, getUserProfile } from "~/server/api/user";
import { cacheTranslations, createTranslator } from "~/server/i18n";
import type { SupportedLocale } from "~/server/i18n/shared";
import type { ActivityType, PetID } from "~/server/types";

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
	const activities = createAsync(() => getPetActivities(null, props.params.petId as PetID));
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
					<Show when={activities()}>
						{(activities) => (
							<Card class="flex flex-col gap-6" aria-labelledby="pet-activities-headline">
								<ActivityQuickCreator petId={props.params.petId as PetID} />
								<Text as="h3" with="headline-3" id="pet-activities-headline">
									Past activities
								</Text>
								<ul class="flex flex-col gap-6">
									<For each={Object.entries(activities())}>
										{([date, activities]) => (
											<li>
												<Text with="overline">{date}</Text>
												<ul class="flex flex-col gap-4 ps-4">
													<For each={activities}>
														{(act) => (
															<li class="flex flex-row items-center gap-2">
																<Text as="time" datetime={act.date} with="overline">
																	{act.date}
																</Text>
																<div class="flex flex-1 flex-row gap-2 rounded-2xl p-3">
																	<Icon
																		use="note"
																		class="size-10 rounded-full bg-yellow-100 p-2 text-yellow-950"
																	/>
																	<div class="flex flex-col gap-2">
																		<Text with="body-sm" tone="light">
																			{act.note}
																		</Text>
																	</div>
																</div>
															</li>
														)}
													</For>
												</ul>
											</li>
										)}
									</For>
								</ul>
							</Card>
						)}
					</Show>
				</div>
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
	const user = createAsync(() => getUser());

	return (
		<>
			<Button variant="tonal" tone="primary" popoverTarget="create-activity">
				<Icon use="stack-plus" />
				{t("new-activity.create")}
			</Button>
			<Drawer id="create-activity" heading={t("new-activity.heading")}>
				{(open) => (
					<Show when={user() && open()}>
						<Suspense fallback={null}>
							<NewActivityForm petId={props.petId} locale={user()!.locale} />
						</Suspense>
					</Show>
				)}
			</Drawer>
		</>
	);
}

function NewActivityForm(props: { petId: string; locale: SupportedLocale }) {
	const t = createTranslator("pets");
	const submission = useSubmission(createPetActivity);
	const action = useAction(createPetActivity);

	const [dateChange, setDateChange] = createSignal(false);

	const zoned = Temporal.Now.zonedDateTimeISO();
	const currentDateISO = zoned.toString().slice(0, zoned.toString().indexOf("T") + 6);

	const currentDateFormatted = createFormattedDate(
		() => new Date(zoned.toInstant().epochMilliseconds),
		() => props.locale,
	);
	let dateInputElement: HTMLElement | null = null;

	return (
		<Form
			class="flex flex-col gap-3"
			validationErrors={pickSubmissionValidationErrors(submission)}
			onSubmit={async (e) => {
				e.preventDefault();
				const form = e.currentTarget;
				const formData = new FormData(form);
				const type = formData.get("activityType");
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
						name="activityType"
						value={"observation" satisfies ActivityType}
						checked
						label={t("new-activity.type-observation")}
						icon={<Icon use="note" />}
						class="basis-[10rem] part-[label]:flex-col part-[label]:items-start will-change-[flex-basis] has-[input:checked]:basis-[11rem]"
					/>
					<RadioCard
						name="activityType"
						value={"appointment" satisfies ActivityType}
						label={t("new-activity.type-appointment")}
						icon={<Icon use="first-aid" />}
						class="basis-[10rem] part-[label]:flex-col part-[label]:items-start will-change-[flex-basis] has-[input:checked]:basis-[11rem]"
					/>
					<RadioCard
						name="activityType"
						value={"prescription" satisfies ActivityType}
						label={t("new-activity.type-prescription")}
						icon={<Icon use="pill" />}
						class="basis-[10rem] part-[label]:flex-col part-[label]:items-start will-change-[flex-basis] has-[input:checked]:basis-[11rem]"
					/>
					<RadioCard
						name="activityType"
						value={"vaccination" satisfies ActivityType}
						label={t("new-activity.type-vaccination")}
						icon={<Icon use="syringe" />}
						class="basis-[10rem] part-[label]:flex-col part-[label]:items-start will-change-[flex-basis] has-[input:checked]:basis-[11rem]"
					/>
				</div>
			</Fieldset>
			<Show
				when={dateChange()}
				children={
					<TextField
						variant="ghost"
						type="datetime-local"
						name="recordedDate"
						label="Date"
						description="Change recorded date and time"
						class="view-transition-[new-activity-date-input]"
						value={currentDateISO}
						ref={(el) => {
							dateInputElement = el;
						}}
					/>
				}
				fallback={
					<div class="flex flex-row justify-start">
						<Button
							variant="tonal"
							label="Change recorded date and time"
							onClick={(event) => {
								// @ts-expect-error view-transition-name is not a standard attribute
								event.currentTarget.style["view-transition-name"] = "new-activity-date-button";
								startViewTransition(() => {
									setDateChange(true);
								}).finished.then(() => {
									dateInputElement?.focus();
								});
							}}
						>
							<Text
								as="time"
								datetime={currentDateISO}
								tone="light"
								class="flex flex-row items-center gap-2 font-light text-sm"
							>
								{currentDateFormatted()}
								<Icon use="pencil" size="xs" />
							</Text>
						</Button>
					</div>
				}
			/>
			<input type="hidden" name="currentTimeZone" value={zoned.timeZoneId} />
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
	);
}

export default PetPage;
