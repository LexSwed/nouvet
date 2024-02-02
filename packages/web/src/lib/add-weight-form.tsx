import { createAsync, useSubmission } from '@solidjs/router';
import { clientOnly } from '@solidjs/start';
import { createMemo } from 'solid-js';
import { Button, Form, Icon, Text, TextField } from '@nou/ui';

import { updatePetWeight } from '~/api/pet';
import { getUserMeasurementSystem } from '~/api/user';
import type { DatabasePet } from '~/server/db/schema';
import { createTranslator, userLocale } from '~/server/i18n';

const Drawer = clientOnly(() =>
  import('@nou/ui').then((ui) => ({ default: ui.Drawer })),
);

const petTypeToMetricMeasurement: {
  metrical: Record<DatabasePet['type'], 'kilogram' | 'gram'>;
  imperial: Record<DatabasePet['type'], 'pound' | 'ounce'>;
} = {
  metrical: {
    dog: 'kilogram',
    cat: 'kilogram',
    bird: 'gram',
    rabbit: 'gram',
    rodent: 'gram',
    horse: 'kilogram',
  },
  imperial: {
    dog: 'pound',
    cat: 'pound',
    bird: 'ounce',
    rabbit: 'ounce',
    rodent: 'ounce',
    horse: 'pound',
  },
};

interface AddWeightFormProps {
  id: string;
  pet: { id: number; name: string; type: DatabasePet['type'] };
  onDismiss: () => void;
}

const AddWeightForm = (props: AddWeightFormProps) => {
  const t = createTranslator('app');
  const locale = userLocale();
  const measurementSystem = createAsync(() => getUserMeasurementSystem());
  const petSubmission = useSubmission(updatePetWeight);

  const unit = createMemo(() => {
    let unit = 'kilogram';
    if (measurementSystem() && props.pet.type) {
      unit = petTypeToMetricMeasurement[measurementSystem()!][props.pet.type];
    }
    return new Intl.NumberFormat(locale(), {
      style: 'unit',
      unit,
    })
      .format(0)
      .split(' ')[1];
  });

  return (
    <Drawer
      id={props.id}
      aria-labelledby={`${props.id}-drawer`}
      placement="bottom-start"
    >
      <Form
        class="flex w-[360px] max-w-full flex-col gap-6"
        action={updatePetWeight}
        method="post"
        validationErrors={petSubmission.result?.errors}
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
            {t('app.animal-add-weight.label', { name: props.pet.name })}
          </Text>
        </div>
        <TextField
          name="weight"
          type="number"
          step="0.01"
          min="0"
          max="9999"
          label={t('app.animal-shortcut.weight')}
          class="flex-[2]"
          suffix={unit()}
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
