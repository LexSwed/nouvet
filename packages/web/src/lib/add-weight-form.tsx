import { createAsync, useSubmission } from '@solidjs/router';
import { clientOnly } from '@solidjs/start';
import { Button, Form, Icon, Text, TextField } from '@nou/ui';

import { updatePetBirthDate } from '~/api/pet';
import { getUserMeasurementSystem } from '~/api/user';
import { createTranslator } from '~/server/i18n';

const Drawer = clientOnly(() =>
  import('@nou/ui').then((ui) => ({ default: ui.Drawer })),
);

const AddWeightForm = (props: {
  id: string;
  pet: { id: number; name: string };
}) => {
  const t = createTranslator('app');
  const measurementSystem = createAsync(() => getUserMeasurementSystem());
  const petSubmission = useSubmission(updatePetBirthDate);

  return (
    <Drawer
      id={props.id}
      aria-labelledby={`${props.id}-drawer`}
      placement="bottom-start"
    >
      <Form
        class="flex w-[360px] max-w-full flex-col gap-6"
        action={updatePetBirthDate}
        method="post"
        validationErrors={petSubmission.result?.errors}
      >
        <input type="hidden" name="petId" value={props.pet.id} />
        <Text
          with="label"
          class="flex items-center gap-2"
          id={`${props.id}-drawer`}
        >
          <span class="bg-on-surface/5 rounded-full p-3">
            <Icon use="scales" size="md" />
          </span>
          {t('app.animal-add-weight.label', { name: props.pet.name })}
        </Text>
        <TextField
          name="weight"
          type="number"
          step="0.01"
          min="0"
          max="999"
          label={t('app.animal-shortcut.weight')}
        />
        <div class="grid grid-cols-2 gap-2 sm:flex sm:self-end">
          <Button
            variant="ghost"
            popoverTargetAction="hide"
            popoverTarget={props.id}
            class="px-6"
          >
            {t('app.animal.drawer.cancel')}
          </Button>
          <Button
            type="submit"
            class="px-6"
            loading={petSubmission.pending}
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

export default AddWeightForm;
