import { action, revalidate, useSubmission } from '@solidjs/router';
import { Show, type ParentProps } from 'solid-js';
import { getRequestEvent } from 'solid-js/web';
import { Button, Card, Form, Text, TextField } from '@nou/ui';

import { createTranslator } from '~/i18n';
import { AnimalTypeSelect } from '~/lib/animal-type';
import { GenderSwitch } from '~/lib/animal-type/animal-type';
import { getRequestUser } from '~/server/auth/user-session';
import { createPet as createDbPet } from '~/server/db/queries/createPet';
import { getUserFamilyAndPets } from '../routes/app/_queries';

const createPet = action(async (formData) => {
  'use server';
  const event = getRequestEvent();
  const currentUser = await getRequestUser(event!);
  try {
    const result = await createDbPet(
      {
        name: formData.get('name'),
        type: formData.get('type'),
        gender: formData.get('gender'),
      },
      currentUser.userId,
    );
    if (result.errors) {
      return { errors: result.errors };
    }
    revalidate(getUserFamilyAndPets.key);
    return result;
  } catch (error) {
    console.error(error);
    return { failed: true };
  }
}, 'createPet');

interface CreateNewPetForm extends ParentProps {
  minimal: boolean;
}

function CreateNewPetForm(props: CreateNewPetForm) {
  const t = createTranslator('app');
  const petSubmission = useSubmission(createPet);

  const isFailed = () =>
    petSubmission.result &&
    'failed' in petSubmission.result &&
    petSubmission.result.failed;

  return (
    <Card class="flex flex-col gap-6 p-4">
      <Form
        aria-labelledby="new-pet"
        class="flex flex-col gap-6"
        action={createPet}
        validationErrors={petSubmission.result?.errors || undefined}
        method="post"
        aria-errormessage="error-message"
      >
        <Text with="headline-2" as="h3" id="new-pet">
          {t('app.new-pet-heading')}
        </Text>
        <TextField
          label={t('app.new-pet-text-field-label')}
          placeholder={t('app.new-pet-text-field-placeholder')}
          name="name"
          required
        />
        <AnimalTypeSelect name="type" />
        <GenderSwitch name="gender" />

        <Show when={isFailed()}>
          <Card variant="filled" id="error-message" aria-live="polite">
            <Text with="body">{t('app.new-pet-failure.title')}</Text>
            <Text with="body-sm" as="p">
              {t('app.new-pet-failure.message')}
            </Text>
          </Card>
        </Show>

        <Button loading={petSubmission.pending} type="submit">
          Create
        </Button>
      </Form>
      {props.children}
    </Card>
  );
}

export { CreateNewPetForm };
