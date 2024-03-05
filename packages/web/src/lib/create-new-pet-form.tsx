import { useSubmission } from '@solidjs/router';
import { createEffect, Show } from 'solid-js';
import { Button, Form, Text, TextField } from '@nou/ui';

import { createPetAction } from '~/server/api/pet';
import { createTranslator } from '~/server/i18n';

import { AnimalTypeSelect } from '~/lib/animal-type';
import { GenderSwitch } from '~/lib/animal-type/animal-type';

import { FormErrorMessage } from './form-error-message';

function CreateNewPetForm(props: { onSuccess?: () => void }) {
  const t = createTranslator('pet-forms');
  const petSubmission = useSubmission(createPetAction);

  const hasFailed = () =>
    petSubmission.result &&
    'failed' in petSubmission.result &&
    petSubmission.result.failed;

  createEffect(() => {
    if (petSubmission.result && 'pet' in petSubmission.result) {
      props.onSuccess?.();
    }
  });

  return (
    <Form
      aria-labelledby="new-pet"
      class="flex flex-col gap-6"
      action={createPetAction}
      validationErrors={petSubmission.result?.errors || undefined}
      method="post"
      aria-errormessage="error-message"
    >
      <Text with="headline-2" as="h3" id="new-pet">
        {t('new-pet-heading')}
      </Text>
      <TextField
        label={t('new-pet-text-field-label')}
        placeholder={t('new-pet-text-field-placeholder')}
        name="name"
        required
      />
      <AnimalTypeSelect name="type" />
      <GenderSwitch name="gender" />

      <Show when={hasFailed()}>
        <FormErrorMessage />
      </Show>

      <Button loading={petSubmission.pending} type="submit">
        Create
      </Button>
    </Form>
  );
}

export default CreateNewPetForm;
