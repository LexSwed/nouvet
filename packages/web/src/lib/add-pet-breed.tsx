import { Button, Drawer, Form, Icon, Text, TextField, Toast, toast } from "@nou/ui";
import { useAction, useSubmission } from "@solidjs/router";
import { type ComponentProps, Show } from "solid-js";

import { updatePetBreed } from "~/server/api/pet";
import { createTranslator } from "~/server/i18n";

import { FormErrorMessage } from "./form-error-message";
import { isSubmissionGenericError, pickSubmissionValidationErrors } from "./utils/submission";

interface AddBreedFormProps {
	id: string;
	pet: { id: string; name: string };
	onDismiss?: () => void;
	placement?: ComponentProps<typeof Drawer>["placement"];
}

const AddBreedForm = (props: AddBreedFormProps) => {
	const t = createTranslator("pets");

	const breedSubmission = useSubmission(updatePetBreed);
	const submitBreedAction = useAction(updatePetBreed);

	return (
		<Drawer
			id={props.id}
			aria-labelledby={`${props.id}-drawer`}
			placement={props.placement || "top-to-bottom left-to-left"}
			class="sm:w-[280px]"
		>
			{(open) => (
				<Show when={open()}>
					<Show when={isSubmissionGenericError(breedSubmission)}>
						<FormErrorMessage class="mb-3" />
					</Show>
					<Form
						class="flex flex-col gap-6"
						action={updatePetBreed}
						validationErrors={pickSubmissionValidationErrors(breedSubmission)}
						onSubmit={async (e) => {
							const res = await submitBreedAction(new FormData(e.currentTarget));
							if ("pet" in res) {
								toast(() => <Toast>{t("edit.update-success")}</Toast>);
								props.onDismiss?.();
							} else if (res.failureReason === "other") {
								toast(() => <Toast tone="failure">{t("edit.update-failure")}</Toast>);
							}
						}}
					>
						<input type="hidden" name="petId" value={props.pet.id} />
						<div class="flex flex-row gap-4">
							<Text with="label" class="flex items-center gap-2" id={`${props.id}-drawer`}>
								<span class="rounded-full bg-on-surface/5 p-3">
									<Icon use="scales" size="md" />
								</span>
								{t("animal-add-breed.label", { name: props.pet.name })}
							</Text>
						</div>
						<TextField name="breed" type="text" label={t("animal-shortcut.breed")} />
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
							<Button
								type="submit"
								class="px-6"
								pending={breedSubmission.pending}
								popoverTargetAction="hide"
								popoverTarget={props.id}
							>
								{t("animal.drawer.save")}
							</Button>
						</div>
					</Form>
				</Show>
			)}
		</Drawer>
	);
};

export default AddBreedForm;
