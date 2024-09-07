import {
	Button,
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
import { useAction, useSubmission } from "@solidjs/router";
import { Show, createSignal } from "solid-js";
import { isServer } from "solid-js/web";
import { Temporal } from "temporal-polyfill";
import { createPetActivity } from "~/server/api/activity";
import { createTranslator } from "~/server/i18n";
import type { SupportedLocale } from "~/server/i18n/shared";
import type { ActivityType } from "~/server/types";
import { createFormattedDate } from "../utils/format-date";
import { pickSubmissionValidationErrors } from "../utils/submission";

export function NewActivityForm(props: { petId: string; locale: SupportedLocale }) {
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
			<Fieldset legend={<span class="sr-only">{t("new-activity.type-label")}</span>}>
				<div class="overflow-snap -mx-4 flex scroll-px-4 flex-row gap-2 px-4">
					<RadioCard
						name="activityType"
						value={"observation" satisfies ActivityType}
						checked
						label={t("new-activity.type-observation")}
						icon={<Icon use="note" />}
						class="basis-[8.5rem] part-[label]:flex-col part-[label]:items-start will-change-[flex-basis] has-[input:checked]:basis-[9.25rem]"
					/>
					<RadioCard
						name="activityType"
						value={"appointment" satisfies ActivityType}
						label={t("new-activity.type-appointment")}
						icon={<Icon use="first-aid" />}
						class="basis-[8.5rem] part-[label]:flex-col part-[label]:items-start will-change-[flex-basis] has-[input:checked]:basis-[9.25rem]"
					/>
					<RadioCard
						name="activityType"
						value={"prescription" satisfies ActivityType}
						label={t("new-activity.type-prescription")}
						icon={<Icon use="pill" />}
						class="basis-[8.5rem] part-[label]:flex-col part-[label]:items-start will-change-[flex-basis] has-[input:checked]:basis-[9.25rem]"
					/>
					<RadioCard
						name="activityType"
						value={"vaccination" satisfies ActivityType}
						label={t("new-activity.type-vaccination")}
						icon={<Icon use="syringe" />}
						class="basis-[8.5rem] part-[label]:flex-col part-[label]:items-start will-change-[flex-basis] has-[input:checked]:basis-[9.25rem]"
					/>
				</div>
			</Fieldset>
			{isServer ? null : <input type="hidden" name="currentTimeZone" value={zoned.timeZoneId} />}
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
