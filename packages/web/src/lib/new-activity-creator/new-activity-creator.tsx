import { Button, Form, Icon, Text, TextField, Toast, startViewTransition, toast } from "@nou/ui";
import { useAction, useSubmission } from "@solidjs/router";
import { Match, type ParentProps, Show, Switch, createSignal } from "solid-js";
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
						<MultiScreenPopoverHeader class="mb-4">
							<Show when={step() !== "type-select"} fallback={<div />}>
								<Button
									variant="ghost"
									icon
									// label={t("invite.back")}
									onClick={() => update("type-select", "backwards")}
								>
									<Icon use="chevron-left" />
								</Button>
							</Show>
							<Text with="label">
								<Switch>
									<Match when={step() === "type-select"}>
										<Text class="sr-only">{t("new-activity.heading")}</Text>
									</Match>
									<Match when={step() === "observation"}>Note behavior</Match>
									<Match when={step() === "appointment"}>Create appointment</Match>
									<Match when={step() === "prescription"}>Create prescription</Match>
									<Match when={step() === "vaccination"}>Create vaccination event</Match>
								</Switch>
							</Text>
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
				<Icon use="note" class="size-10 rounded-full bg-on-surface/8 p-2 transition-colors" />
				<Text>{t("new-activity.type-observation")}</Text>
			</Button>
			<Button
				class="flex flex-col items-start gap-3 rounded-2xl p-3"
				onClick={() => props.update("appointment")}
			>
				<Icon use="first-aid" class="size-10 rounded-full bg-on-surface/8 p-2 transition-colors" />
				<Text>{t("new-activity.type-appointment")}</Text>
			</Button>
			<Button
				class="flex flex-col items-start gap-3 rounded-2xl p-3"
				onClick={() => props.update("prescription")}
			>
				<Icon use="pill" class="size-10 rounded-full bg-on-surface/8 p-2 transition-colors" />
				<Text>{t("new-activity.type-prescription")}</Text>
			</Button>
			<Button
				class="flex flex-col items-start gap-3 rounded-2xl p-3"
				onClick={() => props.update("vaccination")}
			>
				<Icon use="syringe" class="size-10 rounded-full bg-on-surface/8 p-2 transition-colors" />
				<Text>{t("new-activity.type-vaccination")}</Text>
			</Button>
		</div>
	);
}

function NewActivityForm(
	props: ParentProps<ActivityCreatorProps & { activityType: ActivityType }>,
) {
	const submission = useSubmission(createPetActivity);
	const action = useAction(createPetActivity);
	const t = createTranslator("pets");

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
			<input type="hidden" name="activityType" value="observation" />
			<>
				<input type="hidden" name="currentTimeZone" value={zoned.timeZoneId} />
				<Show
					when={dateChange()}
					children={
						<TextField
							variant="ghost"
							type="datetime-local"
							name="recordedDate"
							label={t("new-activity.recorded-date.label")}
							description={t("new-activity.recorded-date.description")}
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
								label={t("new-activity.recorded-date.description")}
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
			</>
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
	return (
		<NewActivityForm activityType="vaccination" petId={props.petId} locale={props.locale}>
			Vaccination
		</NewActivityForm>
	);
}
