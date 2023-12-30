import { createSignal } from 'solid-js';
import { type Meta } from 'storybook-solidjs';

import {
  date,
  maxValue,
  minValue,
  notValue,
  nullable,
  object,
  safeParse,
  string,
} from 'valibot';
import { Button } from '../button';
import { Card } from '../card';
import { Form } from './form';
import { TextField } from './';

const meta = {
  title: 'TextField',
  component: TextField,
  argTypes: {},
} satisfies Meta<typeof TextField>;

export default meta;

export const Primary = () => <TextField name="name" label="Pet name" />;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const WithErrors = () => {
  const [loading, setLoading] = createSignal(false);
  const [errors, setErrors] = createSignal<Record<string, string> | null>(null);

  async function server(data: unknown) {
    const PetSchema = object({
      name: string('Name cannot be empty', [
        notValue('admin', 'This name is already taken ;)'),
      ]),
      bday: nullable(
        date('Date format is incorrect', [
          minValue(new Date(1990, 0, 1), 'Cannot be before 1990'),
          maxValue(new Date(), 'Birth day cannot exceed current date'),
        ]),
      ),
    });
    await sleep(400);
    const result = safeParse(PetSchema, data);
    if (!result.success) {
      return {
        errors: Object.fromEntries(
          result.issues.map((issue) => [issue.path?.[0].key, issue.message]),
        ),
      };
    }
    return { pet: result.output };
  }

  return (
    <Card variant="flat" class="mx-auto w-[360px]">
      <Form
        class="flex flex-col gap-4"
        validationErrors={errors()}
        // eslint-disable-next-line solid/reactivity
        onSubmit={async (event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          setLoading(true);
          const { errors } = await server({
            name: formData.get('name'),
            bday: (
              event.currentTarget.elements.namedItem('bday') as HTMLInputElement
            ).valueAsDate,
          });
          if (errors) {
            setErrors(errors);
          } else {
            setErrors(null);
          }
          setLoading(false);
        }}
      >
        <TextField
          name="name"
          label="Pet name"
          placeholder="Garfield"
          pattern="[a-zA-Z]*"
          autocomplete="off"
          required
          minLength={2}
        />
        <TextField
          name="bday"
          label="Pet's birth date"
          autocomplete="off"
          type="month"
        />
        <Button type="submit" loading={loading()} class="ms-auto w-[7rem]">
          Submit
        </Button>
      </Form>
    </Card>
  );
};
