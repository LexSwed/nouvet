import {
	Button,
	Card,
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
	type Accessor,
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
	id: string;
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
			activityType="observation"
			petId={props.petId}
			locale={props.locale}
			id={props.id}
		>
			<DateSelector
				value={recordedDate()}
				onChange={setRecordedDate}
				locale={props.locale}
				name="recordedDate"
				label={t("new-activity.note.recorded-date.label")}
				class={"w-[80%] self-start rounded-xl"}
				inline
				showHour
				required
			/>
			<NoteTextField
				description={t("new-activity.note-description-observation")}
				placeholder={t("new-activity.note-placeholder-observation")}
			/>
		</NewActivityForm>
	);
}

export function AppointmentActivityForm(props: ActivityCreatorProps) {
	const t = createTranslator("pets");
	const [recordedDate, setRecordedDate] = createSignal<Temporal.ZonedDateTime | null>(
		Temporal.Now.zonedDateTimeISO(),
	);

	return (
		<NewActivityForm
			activityType="appointment"
			id={props.id}
			petId={props.petId}
			locale={props.locale}
		>
			<DateSelector
				value={recordedDate()}
				onChange={setRecordedDate}
				label={t("new-activity.appointment.date.label")}
				locale={props.locale}
				name="recordedDate"
				inline={false}
				showHour
				class={"w-[80%] self-start rounded-xl"}
				required
			/>
			<TextField
				name="location"
				label={t("new-activity.appointment.location.label")}
				description={t("new-activity.appointment.location.description")}
				variant="ghost"
			/>
			<NoteTextField
				rows={1}
				label={t("new-activity.appointment.note.label")}
				placeholder={t("new-activity.appointment.note-placeholder")}
				description={t("new-activity.appointment.note-description")}
			/>
		</NewActivityForm>
	);
}

export function PrescriptionActivityForm(props: ActivityCreatorProps) {
	const t = createTranslator("pets");
	const now = Temporal.Now.zonedDateTimeISO();

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
			id={props.id}
			petId={props.petId}
			locale={props.locale}
		>
			<input type="hidden" name="recordedDate" value={toIsoString(now)} />
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
					aria-label={t("new-activity.prescription.due-date.intervals")}
					onChange={(e) => {
						const startDate = dateStarted();
						if (startDate) {
							const weeks = Number.parseInt((e.target as HTMLInputElement).value);
							const newDate = startDate.add({ weeks });
							setEndDate(newDate);
						}
					}}
					class="contents"
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
			<NoteTextField
				placeholder={t("new-activity.prescription.note-placeholder")}
				description={t("new-activity.prescription.note-description")}
			/>
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
			id={props.id}
			petId={props.petId}
			locale={props.locale}
		>
			<DateSelector
				value={recordedDate()}
				onChange={(newRecordedDate) => {
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
				locale={props.locale}
				name="recordedDate"
				inline={false}
				showHour
				label={t("new-activity.vaccine.date.label")}
				class={"w-[80%] self-start rounded-xl"}
				required
			/>
			<TextField
				name="name"
				variant="ghost"
				label={t("new-activity.vaccine.name.label")}
				description={t("new-activity.vaccine.name.description")}
				placeholder={t("new-activity.vaccine.name.placeholder")}
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
					aria-label={t("new-activity.vaccine.due-date.intervals")}
					onChange={(e) => {
						const startDate = recordedDate();
						if (startDate) {
							const months = Number.parseInt((e.target as HTMLInputElement).value);
							const newDate = startDate.add({ months });
							setNextDueDate(newDate);
						}
					}}
					class="contents"
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
				placeholder={t("new-activity.vaccine.note-placeholder")}
				description={t("new-activity.vaccine.note-description")}
			/>
		</NewActivityForm>
	);
}

function NewActivityForm(
	props: ParentProps<
		ActivityCreatorProps & {
			activityType: ActivityType;
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
						document.getElementById(props.id)?.hidePopover();
					}
				}}
				ref={props.ref}
			>
				<input type="hidden" name="petId" value={props.petId} />
				<input type="hidden" name="activityType" value={props.activityType} />
				<input type="hidden" name="currentTimeZone" value={Temporal.Now.timeZoneId()} />
				{props.children}
				<div class="mt-4 flex flex-row justify-end gap-4 *:flex-1">
					<Button variant="ghost" popoverTargetAction="hide" popoverTarget={props.id}>
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

function NoteTextField(props: {
	rows?: number;
	label?: string;
	placeholder?: string;
	description?: string;
}) {
	const t = createTranslator("pets");
	return (
		<TextField
			as="textarea"
			name="note"
			label={props.label ?? t("new-activity.note-label")}
			placeholder={props.placeholder}
			description={props.description}
			variant="ghost"
			rows={props.rows ?? "2"}
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
	const t = createTranslator("pets");
	const id = createUniqueId();
	return (
		<div class="flex w-full flex-col gap-2">
			<Text class="-mb-2 ps-3" with="label-sm" as="label" for={id}>
				{props.label}
			</Text>
			<div class="rounded-xl bg-on-surface/3 transition-colors duration-150 focus-within:bg-on-surface/5">
				<div class="flex min-h-14 flex-row items-center gap-2 px-2 py-2">
					{props.children}
					<Button
						icon
						size="sm"
						label={t("new-activity.end-date.clear")}
						variant="ghost"
						class={tw("ms-auto", props.endDate() ? "flex" : "hidden")}
						onClick={() => props.onEndDateChange(null)}
						aria-labelledby={id}
					>
						<Icon use="x" size="xs" />
					</Button>
				</div>
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
