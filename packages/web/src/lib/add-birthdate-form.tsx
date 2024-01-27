import { For } from 'solid-js';
import { Button, Drawer, Form, Option, Picker, Text, TextField } from '@nou/ui';

import { createTranslator } from '~/server/i18n';

const AddBirthDateForm = (props: { id: string }) => {
  // const t = createTranslator('app');
  // console.log(t('app.animal-gender'));
  const formatter = Intl.DateTimeFormat(document.documentElement.lang, {
    month: 'long',
  });
  const monthNames = Array.from({ length: 12 }).map((_, month) => {
    const date = new Date();
    date.setMonth(month, 1);
    return formatter.format(date);
  });

  return (
    <Drawer id={props.id}>
      <Form
        onSubmit={(e) => e.preventDefault()}
        class="max-w-[380px] flex flex-col gap-6"
      >
        <fieldset>
          <Text as="legend" with="label" class="mb-6 inline-block">
            Pet's birth date
          </Text>
          <div class="grid grid-cols-[3.5rem_1fr_5rem] gap-2">
            <TextField
              name="bday"
              label="Day"
              autocomplete="off"
              type="number"
              inputMode="numeric"
              min="1"
              max="31"
              step="1"
              pattern="\d{1,2}"
            />
            <Picker label="Month" name="bmonth" autocomplete="off">
              <Option value="" />
              <For each={monthNames}>
                {(month, index) => <Option value={index()}>{month}</Option>}
              </For>
            </Picker>
            <TextField
              name="byear"
              label="Year"
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
            Later
          </Button>
          <Button type="submit" size="sm" class="px-6">
            Save
          </Button>
        </div>
      </Form>
    </Drawer>
  );
};

export default AddBirthDateForm;
