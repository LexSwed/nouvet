import { For } from 'solid-js';
import { Form, Option, Picker, Text, TextField } from '@nou/ui';

import { createTranslator } from '~/server/i18n';

const AddBirthDateForm = () => {
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
    <Form onSubmit={(e) => e.preventDefault()} class="max-w-[320px]">
      <fieldset>
        <Text as="legend" with="label-sm" class="mb-2 inline-block">
          Pet's birth date
        </Text>
        <div class="flex flex-row gap-2">
          <TextField
            name="bday"
            label="Day"
            autocomplete="off"
            type="number"
            inputMode="numeric"
            min="1"
            max="31"
            class="flex-1"
          />
          <Picker
            label="Month"
            name="bmonth"
            autocomplete="off"
            class="flex-[2]"
          >
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
            class="flex-1"
          />
        </div>
      </fieldset>
    </Form>
  );
};

export default AddBirthDateForm;
