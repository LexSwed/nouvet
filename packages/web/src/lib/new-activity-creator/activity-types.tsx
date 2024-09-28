import { Button, Card, Fieldset, Form, RadioCard, Text, TextField, Toast, toast } from "@nou/ui";
import { useAction, useSubmission } from "@solidjs/router";
import {
	type Accessor,
	type ComponentProps,
	type ParentProps,
	Show,
	batch,
	createMemo,
	createSignal,
	createUniqueId,
} from "solid-js";
import { Temporal } from "temporal-polyfill";
import { createPetActivity } from "~/server/api/activity";
import { createTranslator } from "~/server/i18n";
import type { SupportedLocale } from "~/server/i18n/shared";
import type { ActivityType, PetID } from "~/server/types";
import { createFormattedDate } from "../utils/format-date";
import { isSubmissionGenericError, pickSubmissionValidationErrors } from "../utils/submission";

interface ActivityCreatorProps {
	petId: PetID;
	locale: SupportedLocale;
}

export function ObservationActivityForm(props: ActivityCreatorProps) {
	const t = createTranslator("pets");

	const [recordedDate, setRecordedDate] = createSignal<Temporal.ZonedDateTime | null>(
		Temporal.Now.zonedDateTimeISO(),
	);

	return (
		<NewActivityForm
			recordedDate={recordedDate}
			onRecordedDateChange={setRecordedDate}
			activityType="observation"
			petId={props.petId}
			locale={props.locale}
		>
			<NoteTextField
				description={t("new-activity.note-description-observation")}
				placeholder={t("new-activity.note-placeholder-observation")}
			/>
		</NewActivityForm>
	);
}

export function AppointmentActivityForm(props: ActivityCreatorProps) {
	const t = createTranslator("pets");
	const [date, setDate] = createSignal<Temporal.ZonedDateTime | null>(null);

	// hidden, unchangeable recorded date
	const recordedDate = () => Temporal.Now.zonedDateTimeISO();

	return (
		<NewActivityForm
			activityType="appointment"
			recordedDate={recordedDate}
			recordedDateHidden={true}
			petId={props.petId}
			locale={props.locale}
		>
			<TextField
				name="location"
				label={t("new-activity.appointment.location.label")}
				description={t("new-activity.appointment.location.description")}
				variant="ghost"
			/>
			<DateSelector
				name="date"
				value={date()}
				onChange={setDate}
				label={t("new-activity.appointment.date.label")}
				showHour
				inline={false}
				locale={props.locale}
				required
			/>
			<NoteTextField
				placeholder={t("new-activity.note-placeholder-appointment")}
				description={t("new-activity.note-description-observation")}
			/>
		</NewActivityForm>
	);
}

export function PrescriptionActivityForm(props: ActivityCreatorProps) {
	const t = createTranslator("pets");
	const recordedDate = () => Temporal.Now.zonedDateTimeISO();

	const [dateStarted, setDateStarted] = createSignal<Temporal.ZonedDateTime | null>(
		Temporal.Now.zonedDateTimeISO(),
	);
	const [endDate, setEndDate] = createSignal<Temporal.ZonedDateTime | null>(null);

	const weeksDiff = createMemo(() => {
		const start = dateStarted();
		const end = endDate();
		if (!start || !end) return null;
		return end.with({ hour: 0, minute: 0 }).since(start.with({ hour: 0, minute: 0 }), {
			smallestUnit: "weeks",
			largestUnit: "weeks",
		}).weeks;
	});

	return (
		<NewActivityForm
			activityType="prescription"
			recordedDate={recordedDate}
			recordedDateHidden={true}
			petId={props.petId}
			locale={props.locale}
		>
			{/* Type should probably go into the schedule and dosage */}
			{/* <Fieldset legend="Type">
				<div class="overflow-snap-0 gap-2">
					<RadioCard
						name="schedule.type"
						label="Pill"
						value={"pill" satisfies PrescriptionMedicationType}
					/>
					<RadioCard
						name="schedule.type"
						label="Liquid"
						value={"liquid" satisfies PrescriptionMedicationType}
					/>
					<RadioCard
						name="schedule.type"
						label="Injection"
						value={"injection" satisfies PrescriptionMedicationType}
					/>
					<RadioCard
						name="schedule.type"
						label="Other"
						value={"other" satisfies PrescriptionMedicationType}
					/>
				</div>
			</Fieldset> */}
			<TextField
				label={t("new-activity.prescription.name.label")}
				name="name"
				variant="ghost"
				required
				minLength={2}
			/>
			<DateSelector
				name="dateStarted"
				label={t("new-activity.prescription.dateStarted.label")}
				showHour={false}
				locale={props.locale}
				value={dateStarted()}
				onChange={(newDateStarted) => {
					const oldStart = dateStarted();
					const end = endDate();
					batch(() => {
						setDateStarted(newDateStarted);
						if (newDateStarted && oldStart && end) {
							const diff = end.since(oldStart);
							setEndDate(newDateStarted.add(diff));
						}
					});
				}}
				inline={false}
				required
			/>
			<EndDateSelector
				name="endDate"
				label={t("new-activity.prescription.endDate.label")}
				endDate={endDate}
				onEndDateChange={setEndDate}
				placeholder={t("new-activity.prescription.endDate.placeholder")}
				locale={props.locale}
			>
				<Fieldset
					legend={<span class="sr-only">{t("new-activity.vaccine.due-date.label")}</span>}
					onChange={(e) => {
						const startDate = dateStarted();
						if (startDate) {
							const weeks = Number.parseInt((e.target as HTMLInputElement).value);
							const newDate = startDate.add({ weeks });
							setEndDate(newDate);
						}
					}}
					class="flex flex-row items-center gap-2"
				>
					<RadioCard
						label={<Text with="label-sm">{t("new-activity.prescription.endDate.1-week")}</Text>}
						checked={weeksDiff() === 1}
						name="end-date-shortcut"
						value={1}
						class="rounded-full bg-surface py-2"
					/>
					<RadioCard
						label={<Text with="label-sm">{t("new-activity.prescription.endDate.2-weeks")}</Text>}
						checked={weeksDiff() === 2}
						name="end-date-shortcut"
						value={2}
						class="rounded-full bg-surface py-2"
					/>
					<RadioCard
						label={<Text with="label-sm">{t("new-activity.prescription.endDate.1-month")}</Text>}
						checked={weeksDiff() === 4}
						name="end-date-shortcut"
						value={4}
						class="rounded-full bg-surface py-2"
					/>
				</Fieldset>
			</EndDateSelector>
		</NewActivityForm>
	);
}

export function VaccinationActivityForm(props: ActivityCreatorProps) {
	const t = createTranslator("pets");

	const [recordedDate, setRecordedDate] = createSignal<Temporal.ZonedDateTime | null>(
		Temporal.Now.zonedDateTimeISO(),
	);
	const [nextDueDate, setNextDueDate] = createSignal<Temporal.ZonedDateTime | null>(null);

	const monthsDiffDerived = createMemo(() => {
		const recorded = recordedDate();
		const nextDue = nextDueDate();
		if (!recorded || !nextDue) return null;
		return (
			nextDue
				// compare only the starts of the months
				.with({ hour: 0, minute: 0, day: 1 })
				.since(recorded.with({ hour: 0, minute: 0, day: 1 }), {
					smallestUnit: "months",
					largestUnit: "months",
				}).months
		);
	});

	return (
		<NewActivityForm
			activityType="vaccination"
			petId={props.petId}
			locale={props.locale}
			recordedDate={recordedDate}
			onRecordedDateChange={(newRecordedDate) => {
				const oldRecordedDate = recordedDate();
				const dueDate = nextDueDate();
				batch(() => {
					setRecordedDate(newRecordedDate);
					if (newRecordedDate && oldRecordedDate && dueDate) {
						const diff = dueDate.since(oldRecordedDate);
						setNextDueDate(newRecordedDate.add(diff));
					}
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
			<EndDateSelector
				name="nextDueDate"
				label={t("new-activity.vaccine.next-due-date.label")}
				endDate={nextDueDate}
				onEndDateChange={setNextDueDate}
				placeholder={t("new-activity.vaccine.next-due-date.description")}
				locale={props.locale}
			>
				<Fieldset
					legend={<span class="sr-only">{t("new-activity.vaccine.due-date.label")}</span>}
					onChange={(e) => {
						const startDate = recordedDate();
						if (startDate) {
							const months = Number.parseInt((e.target as HTMLInputElement).value);
							const newDate = startDate.add({ months });
							setNextDueDate(newDate);
						}
					}}
					class="flex flex-row items-center gap-2"
				>
					<RadioCard
						label={<Text with="label-sm">{t("new-activity.vaccine.due-date.1-month")}</Text>}
						checked={monthsDiffDerived() === 1}
						name="next-due-date-shortcut"
						value={1}
						class="rounded-full bg-surface py-2"
					/>
					<RadioCard
						label={<Text with="label-sm">{t("new-activity.vaccine.due-date.6-months")}</Text>}
						checked={monthsDiffDerived() === 6}
						name="next-due-date-shortcut"
						value={6}
						class="rounded-full bg-surface py-2"
					/>
					<RadioCard
						label={<Text with="label-sm">{t("new-activity.vaccine.due-date.1-year")}</Text>}
						checked={monthsDiffDerived() === 12}
						name="next-due-date-shortcut"
						value={12}
						class="rounded-full bg-surface py-2"
					/>
				</Fieldset>
			</EndDateSelector>
			<NoteTextField
				placeholder={t("new-activity.note-placeholder-vaccine")}
				description={t("new-activity.note-description-vaccine")}
			/>
		</NewActivityForm>
	);
}

function NewActivityForm(
	props: ParentProps<
		ActivityCreatorProps & {
			activityType: ActivityType;
			recordedDateHidden?: boolean;
			recordedDate: Accessor<Temporal.ZonedDateTime | null>;
			onRecordedDateChange?: ComponentProps<typeof DateSelector>["onChange"];
			ref?: (el: HTMLFormElement) => void;
		}
	>,
) {
	const submission = useSubmission(createPetActivity);
	const action = useAction(createPetActivity);
	const t = createTranslator("pets");

	return (
		<>
			<Show when={isSubmissionGenericError(submission)}>
				<Card
					tone="failure"
					aria-live="assertive"
					class="-mt-2 fade-in-0 mb-3 animate-in duration-300"
				>
					{t("new-activity.error")}
				</Card>
			</Show>
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
					}
				}}
				ref={props.ref}
			>
				<input type="hidden" name="petId" value={props.petId} />
				<input type="hidden" name="activityType" value={props.activityType} />
				<input type="hidden" name="currentTimeZone" value={props.recordedDate()?.timeZoneId} />
				<Show
					when={!props.recordedDateHidden}
					fallback={
						<input
							type="hidden"
							name="recordedDate"
							value={props.recordedDate() ? toIsoString(props.recordedDate()!) : ""}
						/>
					}
				>
					<DateSelector
						value={props.recordedDate()}
						onChange={props.onRecordedDateChange}
						locale={props.locale}
						name="recordedDate"
						inline
						showHour
						label={t("new-activity.recorded-date.label")}
						class="w-[80%] self-start rounded-xl bg-on-surface/3 transition-colors duration-150 focus-within:bg-on-surface/8"
						required
					/>
				</Show>
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
		</>
	);
}

function NoteTextField(props: { placeholder?: string; description?: string }) {
	const t = createTranslator("pets");
	return (
		<TextField
			as="textarea"
			name="note"
			label={t("new-activity.note-label")}
			placeholder={props.placeholder}
			description={props.description}
			variant="ghost"
			rows="2"
			maxLength={1000}
			class="part-[input]:max-h-[5lh]"
			onKeyDown={(e) => {
				if (e.key === "Enter" && e.metaKey && e.currentTarget.form) {
					e.preventDefault();
					e.currentTarget.form.dispatchEvent(new Event("submit"));
				}
			}}
		/>
	);
}

function EndDateSelector(
	props: ParentProps<{
		name: string;
		label?: string;
		placeholder?: string;
		description?: string;
		locale: SupportedLocale;
		endDate: Accessor<Temporal.ZonedDateTime | null>;
		onEndDateChange: (newDate: Temporal.ZonedDateTime | null) => void;
	}>,
) {
	const id = createUniqueId();
	return (
		<div class="flex w-full flex-col gap-2">
			<Text class="-mb-2 ps-3" with="label-sm" as="label" for={id}>
				{props.label}
			</Text>
			<div class="rounded-xl bg-on-surface/3 transition-colors duration-150 focus-within:bg-on-surface/5">
				<div class="mx-2 my-1">{props.children}</div>
				<DateSelector
					name={props.name}
					value={props.endDate()}
					onChange={props.onEndDateChange}
					placeholder={props.placeholder}
					showHour={false}
					id={id}
					locale={props.locale}
					inline
					class="pb-1"
				/>
			</div>
		</div>
	);
}

function DateSelector(props: {
	locale: SupportedLocale;
	name: string;
	value?: Temporal.ZonedDateTime | null;
	onChange?: (newDate: Temporal.ZonedDateTime | null) => void;
	min?: Temporal.ZonedDateTime;
	max?: Temporal.ZonedDateTime;
	inline: boolean;
	class?: string;
	label?: string;
	id?: string;
	description?: string;
	placeholder?: string;
	showHour: boolean;
	required?: boolean;
}) {
	const currentDateFormatted = createFormattedDate(
		() => props.value,
		() => props.locale,
		{
			year: "numeric",
			hour: props.showHour ? "numeric" : null,
		},
	);

	return (
		<div class={props.class}>
			<TextField
				id={props.id}
				value={props.value ? toIsoString(props.value, props.showHour) : ""}
				min={props.min ? toIsoString(props.min, props.showHour) : undefined}
				max={props.max ? toIsoString(props.max, props.showHour) : undefined}
				onInput={(e) => {
					if (!props.onChange) return;
					// do nothing if the input just has an incorrect date (assumed it's temporary)
					if (e.currentTarget.value === "" && e.currentTarget.validity.badInput) return;
					const d = new Date(e.currentTarget.value);
					if (Number.isNaN(d.getTime())) return props.onChange(null);

					const newDate = Temporal.Now.zonedDateTimeISO().with({
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
				inline={props.inline}
				textSize="sm"
				required={props.required}
				name={props.name}
				label={props.label}
				description={props.description}
				placeholder={props.placeholder}
				overlay={<div class="pe-12">{currentDateFormatted()}</div>}
			/>
		</div>
	);
}

function toIsoString(date: Temporal.ZonedDateTime, showHour = true) {
	return showHour
		? date.toString().slice(0, date.toString().indexOf("T") + 6)
		: date.toString().slice(0, date.toString().indexOf("T"));
}
