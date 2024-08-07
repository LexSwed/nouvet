import { Button, Form, Text, TextField } from "@nou/ui";
import { useAction, useSubmission } from "@solidjs/router";
import { Show } from "solid-js";

import { createPet } from "~/server/api/pet";
import { createTranslator } from "~/server/i18n";

import { FormErrorMessage } from "./form-error-message";
import { GenderSwitch, SpeciesSelector } from "./species-selector";

function CreateNewPetForm(props: {
	onSuccess?: (pet: { name: string; id: string }) => void;
}) {
	const t = createTranslator("pets");
	const createPetAction = useAction(createPet);
	const petSubmission = useSubmission(createPet);

	const hasUnknownError = () =>
		petSubmission.result &&
		"failed" in petSubmission.result &&
		petSubmission.result.failed &&
		!petSubmission.result.errors;

	return (
		<Form
			aria-labelledby="new-pet-headline"
			class="flex flex-col gap-6"
			action={createPet}
			onSubmit={async (event) => {
				// progressively enhancing, allowing onSuccess to be executed even after the submission
				event.preventDefault();
				const formData = new FormData(event.currentTarget);
				const result = await createPetAction(formData);
				if ("pet" in result) {
					props.onSuccess?.(result.pet);
				}
			}}
			validationErrors={
				petSubmission.result && "errors" in petSubmission.result
					? petSubmission.result.errors
					: undefined
			}
			method="post"
			aria-errormessage="error-message"
		>
			<Text with="headline-2" as="h3" id="new-pet-headline" class="ps-2">
				{t("new-pet-heading")}
			</Text>
			<TextField
				label={t("new-pet-text-field-label")}
				placeholder={t("new-pet-text-field-placeholder")}
				name="name"
				required
			/>
			<SpeciesSelector name="species" />
			<GenderSwitch name="gender" />

			<Show when={hasUnknownError()}>
				<FormErrorMessage />
			</Show>

			<Button loading={petSubmission.pending} type="submit">
				{t("cta.create")}
			</Button>
		</Form>
	);
}

export default CreateNewPetForm;
