import {
	Button,
	Fieldset,
	Form,
	Icon,
	RadioCard,
	Text,
	TextField,
	Toast,
	toast,
	tw,
} from "@nou/ui";
import { useAction, useSubmission } from "@solidjs/router";
import {
	type ComponentProps,
	Match,
	type ParentProps,
	Show,
	Switch,
	batch,
	createSignal,
} from "solid-js";
import { Temporal } from "temporal-polyfill";
import { createPetActivity } from "~/server/api/activity";
import { createTranslator } from "~/server/i18n";
import type { SupportedLocale } from "~/server/i18n/shared";
import type { ActivityType, PetID } from "~/server/types";
import {
	MultiScreenPopover,
	MultiScreenPopoverContent,
	MultiScreenPopoverHeader,
} from "../multi-screen-popover";
import { createFormattedDate } from "../utils/format-date";
import { pickSubmissionValidationErrors } from "../utils/submission";

type Step = ActivityType | "type-select";

type ActivityCreatorProps = {
	petId: PetID;
	locale: SupportedLocale;
};

export function NewActivityCreator(props: {
	petId: PetID;
	locale: SupportedLocale;
}) {
	return (
		<MultiScreenPopover id={"create-activity"} component="drawer">
			{(controls) => {
				const t = createTranslator("pets");
				const [step, setStep] = createSignal<Step>("type-select");
				const update = async (newStep: Step, direction: "forwards" | "backwards" = "forwards") => {
					controls.update(async () => {
						setStep(newStep);
					}, direction);
				};

				return (
					<>
						<MultiScreenPopoverHeader class="mb-4 justify-between">
							<Show when={step() !== "type-select"} fallback={<div />}>
								<Button
									variant="ghost"
									icon
									label={t("new-activity.back-button")}
									onClick={() => update("type-select", "backwards")}
								>
									<Icon use="chevron-left" />
								</Button>
							</Show>

							<Switch>
								<Match when={step() === "type-select"}>
									<Text class="sr-only">{t("new-activity.heading-main")}</Text>
								</Match>
								<Match when={step() === "observation"}>
									<>
										<Text with="label">{t("new-activity.heading-observation")}</Text>
										<Icon
											use="note"
											class="m-2 size-10 rounded-full bg-primary/8 p-2 text-primary"
										/>
									</>
								</Match>
								<Match when={step() === "appointment"}>
									<>
										<Text with="label">{t("new-activity.heading-appointment")}</Text>
										<Icon
											use="first-aid"
											class="m-2 size-10 rounded-full bg-primary/8 p-2 text-primary"
										/>
									</>
								</Match>
								<Match when={step() === "prescription"}>
									<>
										<Text with="label">{t("new-activity.heading-prescription")}</Text>
										<Icon
											use="pill"
											class="m-2 size-10 rounded-full bg-primary/8 p-2 text-primary"
										/>
									</>
								</Match>
								<Match when={step() === "vaccination"}>
									<>
										<Text with="label">{t("new-activity.heading-vaccination")}</Text>
										<Icon
											use="syringe"
											class="m-2 size-10 rounded-full bg-primary/8 p-2 text-primary"
										/>
									</>
								</Match>
							</Switch>
						</MultiScreenPopoverHeader>
						<MultiScreenPopoverContent>
							<Switch>
								<Match when={step() === "type-select"}>
									<ActivitySelection update={update} />
								</Match>
								<Match when={step() === "observation"}>
									<ObservationActivityForm {...props} />
								</Match>
								<Match when={step() === "appointment"}>
									<AppointmentActivityForm {...props} />
								</Match>
								<Match when={step() === "prescription"}>
									<PrescriptionActivityForm {...props} />
								</Match>
								<Match when={step() === "vaccination"}>
									<VaccinationActivityForm {...props} />
								</Match>
							</Switch>
						</MultiScreenPopoverContent>
					</>
				);
			}}
		</MultiScreenPopover>
	);
}

function ActivitySelection(props: { update: (newStep: Step) => void }) {
	const t = createTranslator("pets");
	return (
		<div class="mt-12 grid grid-cols-2 gap-2">
			<Button
				class="flex flex-col items-start gap-3 rounded-2xl p-3"
				onClick={() => props.update("observation")}
			>
				<Icon use="note" class="size-10 rounded-full bg-on-surface/8 p-2" />
				<Text>{t("new-activity.type-observation")}</Text>
			</Button>
			<Button
				class="flex flex-col items-start gap-3 rounded-2xl p-3"
				onClick={() => props.update("appointment")}
			>
				<Icon use="first-aid" class="size-10 rounded-full bg-on-surface/8 p-2" />
				<Text>{t("new-activity.type-appointment")}</Text>
			</Button>
			<Button
				class="flex flex-col items-start gap-3 rounded-2xl p-3"
				onClick={() => props.update("prescription")}
			>
				<Icon use="pill" class="size-10 rounded-full bg-on-surface/8 p-2" />
				<Text>{t("new-activity.type-prescription")}</Text>
			</Button>
			<Button
				class="flex flex-col items-start gap-3 rounded-2xl p-3"
				onClick={() => props.update("vaccination")}
			>
				<Icon use="syringe" class="size-10 rounded-full bg-on-surface/8 p-2" />
				<Text>{t("new-activity.type-vaccination")}</Text>
			</Button>
		</div>
	);
}

function DateSelector(props: {
	locale: SupportedLocale;
	name: string;
	value: Temporal.ZonedDateTime | null;
	onChange?: (newDate: Temporal.ZonedDateTime) => void;
	min?: Temporal.ZonedDateTime;
	max?: Temporal.ZonedDateTime;
	class?: string;
	label?: string;
	id?: string;
	description?: string;
	placeholder?: string;
	showHour: boolean;
	required?: boolean;
}) {
	const currentDateFormatted = createFormattedDate(
		() => props.value ?? undefined,
		() => props.locale,
		{
			year: "numeric",
			hour: props.showHour ? "numeric" : null,
		},
	);
	const toIsoString = (date: Temporal.ZonedDateTime) =>
		props.showHour
			? date.toString().slice(0, date.toString().indexOf("T") + 6)
			: date.toString().slice(0, date.toString().indexOf("T"));

	return (
		<div class={tw("stack place-items-baseline", props.class)}>
			<TextField
				id={props.id}
				value={props.value ? toIsoString(props.value) : ""}
				min={props.min ? toIsoString(props.min) : undefined}
				max={props.max ? toIsoString(props.max) : undefined}
				onInput={(e) => {
					if (!props.onChange) return;
					const d = new Date(e.currentTarget.value);
					if (!props.value || Number.isNaN(d.getTime())) return;

					const newDate = props.value.with({
						year: d.getFullYear(),
						month: d.getMonth() + 1,
						day: d.getDate(),
						hour: d.getHours(),
						minute: d.getMinutes(),
					});
					props.onChange(newDate);
				}}
				variant="ghost"
				type={props.showHour ? "datetime-local" : "date"}
				inline
				textSize="sm"
				required={props.required}
				name={props.name}
				label={props.label}
				description={props.description}
				placeholder={props.placeholder}
				class="peer w-full part-[input]:text-transparent part-[input]:transition-all part-[input]:duration-150 part-[input]:focus-within:text-on-surface"
			/>
			<Text
				with="label"
				tone="light"
				class="pointer-events-none ps-3.5 pe-12 transition-opacity duration-150 peer-has-[:focus-within]:opacity-0"
			>
				<Show
					when={props.value}
					fallback={<span class="text-on-surface/75">{props.placeholder}</span>}
				>
					{currentDateFormatted()}
				</Show>
			</Text>
		</div>
	);
}

function NewActivityForm(
	props: ParentProps<
		ActivityCreatorProps & {
			activityType: ActivityType;
			onChange?: ComponentProps<typeof Form>["onChange"];
		}
	>,
) {
	const submission = useSubmission(createPetActivity);
	const action = useAction(createPetActivity);
	const t = createTranslator("pets");

	const now = Temporal.Now.zonedDateTimeISO();

	return (
		<Form
			class="flex flex-col gap-4"
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
			onChange={props.onChange}
		>
			<input type="hidden" name="petId" value={props.petId} />
			<input type="hidden" name="activityType" value={props.activityType} />
			<input type="hidden" name="currentTimeZone" value={now.timeZoneId} />
			<div class="flex flex-row justify-start">
				<DateSelector
					value={now}
					locale={props.locale}
					name="recordedDate"
					showHour
					label={t("new-activity.recorded-date.label")}
					class="w-[80%] rounded-xl bg-on-surface/3 transition-colors duration-150 focus-within:bg-on-surface/8"
					required
				/>
			</div>
			{props.children}
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

function ObservationActivityForm(props: ActivityCreatorProps) {
	const t = createTranslator("pets");

	return (
		<NewActivityForm activityType="observation" petId={props.petId} locale={props.locale}>
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
		</NewActivityForm>
	);
}

function AppointmentActivityForm(props: ActivityCreatorProps) {
	return (
		<NewActivityForm activityType="appointment" petId={props.petId} locale={props.locale}>
			Appointment
		</NewActivityForm>
	);
}

function PrescriptionActivityForm(props: ActivityCreatorProps) {
	return (
		<NewActivityForm activityType="prescription" petId={props.petId} locale={props.locale}>
			Prescription
		</NewActivityForm>
	);
}

function VaccinationActivityForm(props: ActivityCreatorProps) {
	const t = createTranslator("pets");
	const [startDate, setStartDate] = createSignal(Temporal.Now.zonedDateTimeISO());
	const [nextDueDate, setNextDueDate] = createSignal<Temporal.ZonedDateTime | null>(null);

	/**
	 * Compare only starts of the months.
	 */
	const monthsDiff = () =>
		nextDueDate()
			? nextDueDate()
					?.with({ hour: 0, minute: 0, day: 1 })
					.since(startDate().with({ hour: 0, minute: 0, day: 1 }), {
						smallestUnit: "months",
						largestUnit: "months",
					}).months
			: null;

	return (
		<NewActivityForm
			activityType="vaccination"
			petId={props.petId}
			locale={props.locale}
			onChange={(e) => {
				const formData = new FormData(e.currentTarget);
				const recordedDate = new Date(formData.get("recordedDate")!.toString());
				const nextDueDateShortCut = formData.get("next-due-date-shortcut")
					? Number.parseInt(formData.get("next-due-date-shortcut")!.toString())
					: 6;
				const newStartDate = startDate().with({
					year: recordedDate.getFullYear(),
					month: recordedDate.getMonth() + 1,
					day: recordedDate.getDate(),
					hour: recordedDate.getHours(),
					minute: recordedDate.getMinutes(),
				});
				if (nextDueDate() && newStartDate.equals(startDate())) return;

				batch(() => {
					setNextDueDate(newStartDate.add({ months: nextDueDateShortCut }));
					setStartDate(newStartDate);
				});
			}}
		>
			<TextField
				name="name"
				variant="ghost"
				label={t("new-activity.vaccine.name.label")}
				description={t("new-activity.vaccine.name.description")}
				as="textarea"
			/>
			<div class="flex w-full flex-col gap-2">
				<Text class="-mb-2 ps-3" with="label-sm" as="label" for="vaccine-next-due-date">
					{t("new-activity.vaccine.next-due-date.label")}
				</Text>
				<div class="rounded-xl bg-on-surface/3 transition-colors duration-150 focus-within:bg-on-surface/8">
					<Fieldset
						legend={<span class="sr-only">{t("new-activity.vaccine.due-date.label")}</span>}
						class="mx-2 my-1 flex flex-row items-center gap-2"
						onChange={(e) => {
							const value = Number.parseInt((e.target as HTMLInputElement).value);
							setNextDueDate(startDate().add({ months: value }));
						}}
					>
						<RadioCard
							label={t("new-activity.vaccine.due-date.1-month")}
							checked={monthsDiff() === 1}
							name="next-due-date-shortcut"
							value={1}
							class="rounded-full bg-surface"
						/>
						<RadioCard
							label={t("new-activity.vaccine.due-date.6-months")}
							checked={monthsDiff() === 6}
							name="next-due-date-shortcut"
							value={6}
							class="rounded-full bg-surface"
						/>
						<RadioCard
							label={t("new-activity.vaccine.due-date.1-year")}
							checked={monthsDiff() === 12}
							name="next-due-date-shortcut"
							value={12}
							class="rounded-full bg-surface"
						/>
					</Fieldset>
					<DateSelector
						name="nextDueDate"
						value={nextDueDate()}
						onChange={setNextDueDate}
						placeholder={t("new-activity.vaccine.next-due-date.description")}
						showHour={false}
						id="vaccine-next-due-date"
						locale={props.locale}
						class="pb-2"
					/>
				</div>
			</div>
		</NewActivityForm>
	);
}
