import { Button, Drawer, Fieldset, Form, Icon, Option, Picker, Text, TextField } from "@nou/ui";
import { createAsync, useSubmission } from "@solidjs/router";
import { type ComponentProps, For, Show, createEffect, createMemo } from "solid-js";

import { updatePetBirthDate } from "~/server/api/pet";
import { createTranslator, getLocale } from "~/server/i18n";

import { FormErrorMessage } from "./form-error-message";

interface AddBirthDateFormProps {
	id: string;
	pet: { id: string; name: string };
	onDismiss: () => void;
	placement?: ComponentProps<typeof Drawer>["placement"];
}

const AddBirthDateForm = (props: AddBirthDateFormProps) => {
	const t = createTranslator("pets");
	const userLocale = createAsync(() => getLocale(), { deferStream: true });
	const birthDateSubmission = useSubmission(updatePetBirthDate);

	createEffect(() => {
		if (
			birthDateSubmission.result &&
			"pet" in birthDateSubmission.result &&
			birthDateSubmission.result.pet
		) {
			props.onDismiss();
		}
	});

	const monthNames = createMemo(() => {
		const locale = userLocale();
		if (!locale) return;
		const formatter = Intl.DateTimeFormat(locale.baseName, {
			month: "long",
		});
		const date = new Date();
		return Array.from({ length: 12 }).map((_, month) => {
			date.setMonth(month, 1);
			const monthName = formatter.format(date);
			return monthName.charAt(0).toUpperCase() + monthName.slice(1);
		});
	});
	const dateOfBirthError = () =>
		birthDateSubmission.result?.errors && "dateOfBirth" in birthDateSubmission.result.errors
			? birthDateSubmission.result.errors.dateOfBirth
			: null;

	const submissionFailed = () =>
		birthDateSubmission.result &&
		"failed" in birthDateSubmission.result &&
		birthDateSubmission.result.failed;

	return (
		<Drawer id={props.id} placement={props.placement || "top-to-bottom left-to-left"}>
			<Show when={submissionFailed()}>
				<FormErrorMessage class="mb-3" />
			</Show>
			<Form
				class="flex flex-col gap-6 sm:max-w-[360px]"
				action={updatePetBirthDate}
				validationErrors={birthDateSubmission.result?.errors}
			>
				<input type="hidden" name="petId" value={props.pet.id} />
				<Fieldset
					name="dateOfBirth"
					legend={
						<>
							<span class="rounded-full bg-on-surface/5 p-3">
								<Icon use="calendar-plus" size="md" />
							</span>
							{t("animal-add-birth-date.label", {
								name: props.pet.name,
							})}
						</>
					}
				>
					<div class="grid grid-cols-[4rem_1fr_5rem] gap-2">
						<TextField
							name="bday"
							label={t("animal-add-birth-date.day")}
							autocomplete="off"
							type="number"
							inputMode="numeric"
							min="1"
							max="31"
							step="1"
						/>
						<Picker label={t("animal-add-birth-date.month")} name="bmonth" autocomplete="off">
							<Option value="" label="" />
							<For each={monthNames()}>
								{(month, index) => (
									<Option value={index()} label={<span class="capitalize">{month}</span>} />
								)}
							</For>
						</Picker>
						<TextField
							name="byear"
							label={t("animal-add-birth-date.year")}
							autocomplete="off"
							type="number"
							min="2000"
							max={new Date().getFullYear()}
							required
						/>
					</div>
					<Show when={dateOfBirthError()}>
						{(text) => (
							<Text class="text-error" with="body-sm">
								{text()}
							</Text>
						)}
					</Show>
				</Fieldset>
				<div class="grid grid-cols-2 gap-2 sm:flex sm:self-end">
					<Button
						variant="ghost"
						popoverTargetAction="hide"
						popoverTarget={props.id}
						class="px-6"
						onClick={props.onDismiss}
					>
						{t("animal.drawer.cancel")}
					</Button>
					<Button type="submit" class="px-6" loading={birthDateSubmission.pending}>
						{t("animal.drawer.save")}
					</Button>
				</div>
			</Form>
		</Drawer>
	);
};

export default AddBirthDateForm;
