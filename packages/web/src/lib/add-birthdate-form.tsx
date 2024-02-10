import { createAsync, useSubmission } from '@solidjs/router';
import { createEffect, createMemo, For, Show } from 'solid-js';
import {
  Button,
  Drawer,
  Fieldset,
  Form,
  Icon,
  Option,
  Picker,
  Text,
  TextField,
} from '@nou/ui';

import { createTranslator, getLocale } from '~/server/i18n';
import { updatePetBirthDate } from '~/api/pet';

import { FormErrorMessage } from './form-error-message';

interface AddBirthDateFormProps {
  id: string;
  pet: { id: number; name: string };
  onDismiss: () => void;
}

const AddBirthDateForm = (props: AddBirthDateFormProps) => {
  const t = createTranslator('pet-forms');
  const locale = createAsync(() => getLocale());
  const birthDateSubmission = useSubmission(updatePetBirthDate);

  createEffect(() => {
    if (
      birthDateSubmission.result &&
      'pet' in birthDateSubmission.result &&
      birthDateSubmission.result.pet
    ) {
      props.onDismiss();
    }
  });

  const monthNames = createMemo(() => {
    const formatter = Intl.DateTimeFormat(locale()?.baseName, {
      month: 'long',
    });
    return Array.from({ length: 12 }).map((_, month) => {
      const date = new Date();
      date.setMonth(month, 1);
      return formatter.format(date);
    });
  });
  const dateOfBirthError = () =>
    birthDateSubmission.result?.errors &&
    'dateOfBirth' in birthDateSubmission.result.errors
      ? birthDateSubmission.result.errors.dateOfBirth
      : null;

  const submissionFailed = () =>
    birthDateSubmission.result &&
    'failed' in birthDateSubmission.result &&
    birthDateSubmission.result.failed;

  return (
    <Drawer id={props.id} placement="bottom-start">
      <Show when={submissionFailed()}>
        <FormErrorMessage class="mb-3" />
      </Show>
      <Form
        class="flex flex-col gap-6 sm:max-w-[360px]"
        action={updatePetBirthDate}
        method="post"
        validationErrors={birthDateSubmission.result?.errors}
      >
        <input type="hidden" name="petId" value={props.pet.id} />
        <Fieldset>
          <Text as="legend" with="label" class="mb-6 flex items-center gap-2">
            <span class="bg-on-surface/5 rounded-full p-3">
              <Icon use="calendar-plus" size="md" />
            </span>
            {t('animal-add-birth-date.label', {
              name: props.pet.name,
            })}
          </Text>
          <div class="grid grid-cols-[4rem_1fr_5rem] gap-2">
            <TextField
              name="bday"
              label={t('animal-add-birth-date.day')}
              autocomplete="off"
              type="number"
              inputMode="numeric"
              min="1"
              max="31"
              step="1"
            />
            <Picker
              label={t('animal-add-birth-date.month')}
              name="bmonth"
              autocomplete="off"
            >
              <Option value="" />
              <For each={monthNames()}>
                {(month, index) => <Option value={index()}>{month}</Option>}
              </For>
            </Picker>
            <TextField
              name="byear"
              label={t('animal-add-birth-date.year')}
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
            {t('animal.drawer.cancel')}
          </Button>
          <Button
            type="submit"
            class="px-6"
            loading={birthDateSubmission.pending}
          >
            {t('animal.drawer.save')}
          </Button>
        </div>
      </Form>
    </Drawer>
  );
};

export default AddBirthDateForm;
