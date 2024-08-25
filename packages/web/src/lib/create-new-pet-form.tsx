import { Button, Form, Text, TextField } from "@nou/ui";
import { useAction, useSubmission } from "@solidjs/router";
import { Show } from "solid-js";

import { createPet } from "~/server/api/pet";
import { createTranslator } from "~/server/i18n";

import { FormErrorMessage } from "./form-error-message";
import { GenderSwitch, SpeciesSelector } from "./species-selector";
import { isSubmissionGenericError, pickSubmissionValidationErrors } from "./utils/submission";

function CreateNewPetForm(props: {
	onSuccess?: (pet: { name: string; id: string }) => void;
}) {
	const t = createTranslator("pets");
	const petSubmission = useSubmission(createPet);
	const createPetAction = useAction(createPet);

	return (
		<Form
			aria-labelledby="new-pet-headline"
			class="flex flex-col gap-6"
			action={createPet}
			validationErrors={pickSubmissionValidationErrors(petSubmission).name}
			onSubmit={async (event) => {
				event.preventDefault();
				const result = await createPetAction(new FormData(event.currentTarget));
				if ("pet" in result) {
					props.onSuccess?.(result.pet);
				}
			}}
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

			<Show when={isSubmissionGenericError(petSubmission)}>
				<FormErrorMessage />
			</Show>

			<Button loading={petSubmission.pending} type="submit">
				{t("cta.create")}
			</Button>
		</Form>
	);
}

export default CreateNewPetForm;
