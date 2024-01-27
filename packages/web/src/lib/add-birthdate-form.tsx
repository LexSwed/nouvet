import { clientOnly } from '@solidjs/start';
import { createMemo, For } from 'solid-js';
import { Button, Form, Icon, Option, Picker, Text, TextField } from '@nou/ui';

import { createTranslator, userLocale } from '~/server/i18n';

const Drawer = clientOnly(() =>
  import('@nou/ui').then((ui) => ({ default: ui.Drawer })),
);

const AddBirthDateForm = (props: { id: string }) => {
  const t = createTranslator('app');
  const locale = userLocale();

  const monthNames = createMemo(() => {
    const formatter = Intl.DateTimeFormat(locale(), {
      month: 'long',
    });
    return Array.from({ length: 12 }).map((_, month) => {
      const date = new Date();
      date.setMonth(month, 1);
      return formatter.format(date);
    });
  });

  return (
    <Drawer id={props.id}>
      <Form
        onSubmit={(e) => e.preventDefault()}
        class="max-w-[380px] flex flex-col gap-6"
      >
        <fieldset>
          <Text as="legend" with="label" class="mb-6 flex items-center gap-2">
            <span class="bg-on-surface/5 p-3 rounded-full">
              <Icon use="calendar-plus" size="md" />
            </span>
            {t('app.animal-add-birth-date.label')}
          </Text>
          <div class="grid grid-cols-[3.5rem_1fr_5rem] gap-2">
            <TextField
              name="bday"
              label={t('app.animal-add-birth-date.day')}
              autocomplete="off"
              type="number"
              inputMode="numeric"
              min="1"
              max="31"
              step="1"
              pattern="\d{1,2}"
            />
            <Picker
              label={t('app.animal-add-birth-date.month')}
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
              label={t('app.animal-add-birth-date.year')}
              autocomplete="off"
              type="number"
              min="1990"
              max={new Date().getFullYear()}
            />
          </div>
        </fieldset>
        <div class="grid grid-cols-2 gap-2 sm:flex sm:self-end">
          <Button
            variant="ghost"
            popoverTargetAction="hide"
            popoverTarget={props.id}
            size="sm"
            class="px-6"
          >
            {t('app.animal-add-birth-date.cancel')}
          </Button>
          <Button type="submit" size="sm" class="px-6">
            {t('app.animal-add-birth-date.save')}
          </Button>
        </div>
      </Form>
    </Drawer>
  );
};

export default AddBirthDateForm;
