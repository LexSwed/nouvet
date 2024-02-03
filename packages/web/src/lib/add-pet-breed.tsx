import { useSubmission } from '@solidjs/router';
import { clientOnly } from '@solidjs/start';
import { createEffect } from 'solid-js';
import { Button, Form, Icon, Text, TextField } from '@nou/ui';

import { updatePetBreed } from '~/api/pet';
import type { DatabasePet } from '~/server/db/schema';
import { createTranslator } from '~/server/i18n';

const Drawer = clientOnly(() =>
  import('@nou/ui').then((ui) => ({ default: ui.Drawer })),
);

interface AddBreedFormProps {
  id: string;
  pet: { id: number; name: string; type: DatabasePet['type'] };
  onDismiss: () => void;
}

const AddBreedForm = (props: AddBreedFormProps) => {
  const t = createTranslator('app');

  const breedSubmission = useSubmission(updatePetBreed);

  createEffect(() => {
    if (
      breedSubmission.result &&
      'pet' in breedSubmission.result &&
      breedSubmission.result.pet
    ) {
      props.onDismiss();
    }
  });

  return (
    <Drawer
      id={props.id}
      aria-labelledby={`${props.id}-drawer`}
      placement="bottom-start"
    >
      <Form
        class="flex w-[360px] max-w-full flex-col gap-6"
        action={updatePetBreed}
        method="post"
        validationErrors={breedSubmission.result?.errors}
      >
        <input type="hidden" name="petId" value={props.pet.id} />
        <div class="flex flex-row gap-4">
          <Text
            with="label"
            class="flex items-center gap-2"
            id={`${props.id}-drawer`}
          >
            <span class="bg-on-surface/5 rounded-full p-3">
              <Icon use="scales" size="md" />
            </span>
            {t('app.animal-add-breed.label', { name: props.pet.name })}
          </Text>
        </div>
        <TextField
          name="breed"
          type="text"
          label={t('app.animal-shortcut.breed')}
        />
        <div class="grid grid-cols-2 gap-2 sm:flex sm:self-end">
          <Button
            variant="ghost"
            popoverTargetAction="hide"
            popoverTarget={props.id}
            class="px-6"
            onClick={props.onDismiss}
          >
            {t('app.animal.drawer.cancel')}
          </Button>
          <Button
            type="submit"
            class="px-6"
            loading={breedSubmission.pending}
            popoverTargetAction="hide"
            popoverTarget={props.id}
          >
            {t('app.animal.drawer.save')}
          </Button>
        </div>
      </Form>
    </Drawer>
  );
};

export default AddBreedForm;
