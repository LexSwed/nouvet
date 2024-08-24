import { Button, Drawer, Form, Icon, TextField, Toast, toast } from "@nou/ui";
import { useAction, useSubmission } from "@solidjs/router";
import { type ComponentProps, Show } from "solid-js";

import { updatePetBirthDate } from "~/server/api/pet";
import { createTranslator } from "~/server/i18n";

import { isSubmissionGenericError, isSubmissionValidationError } from "~/lib/utils/submission";
import { FormErrorMessage } from "./form-error-message";

interface AddBirthDateFormProps {
	id: string;
	pet: { id: string; name: string; dateOfBirth: string | null };
	onDismiss: () => void;
	placement?: ComponentProps<typeof Drawer>["placement"];
}

const AddBirthDateForm = (props: AddBirthDateFormProps) => {
	const t = createTranslator("pets");
	const birthDateSubmission = useSubmission(updatePetBirthDate);
	const updateBirthDateAction = useAction(updatePetBirthDate);

	return (
		<Drawer
			id={props.id}
			placement={props.placement || "top-to-bottom left-to-left"}
			heading={
				<div class="flex flex-row items-center gap-4">
					<div class="rounded-full bg-on-surface/5 p-3">
						<Icon use="calendar-plus" size="md" />
					</div>
					{t("animal-add-birth-date.label", {
						name: props.pet.name,
					})}
				</div>
			}
		>
			<Show when={isSubmissionGenericError(birthDateSubmission)}>
				<FormErrorMessage class="mb-3" />
			</Show>
			<Form
				class="flex flex-col gap-6 sm:max-w-[360px]"
				action={updatePetBirthDate}
				validationErrors={
					isSubmissionValidationError(birthDateSubmission)
						? birthDateSubmission.result.errors
						: null
				}
				onSubmit={async (e) => {
					e.preventDefault();
					const result = await updateBirthDateAction(new FormData(e.currentTarget));
					if ("pet" in result) {
						toast(() => <Toast>{t("edit.update-success")}</Toast>);
						props.onDismiss();
					} else if (result.failureReason === "other") {
						toast(() => <Toast>{t("edit.update-failure")}</Toast>);
					}
				}}
			>
				<input type="hidden" name="petId" value={props.pet.id} />

				<TextField
					name="dateOfBirth"
					label={t("edit.birth-date")}
					autocomplete="off"
					type="date"
					value={props.pet.dateOfBirth ?? ""}
					min="2000-01-01"
					max={new Date().toISOString().split("T")[0]}
				/>
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
