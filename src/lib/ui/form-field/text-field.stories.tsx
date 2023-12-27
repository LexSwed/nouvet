import { createSignal } from 'solid-js';
import { type Meta } from 'storybook-solidjs';

import { Button } from '../button';
import { Form } from './form';
import { TextField } from './';

const meta = {
  title: 'TextField',
  component: TextField,
  argTypes: {},
} satisfies Meta<typeof TextField>;

export default meta;

export const Primary = () => <TextField name="name" label="Pet name" />;

export const WithErrors = () => {
  const [loading, setLoading] = createSignal(false);
  const [errors, setErrors] = createSignal<Record<string, string> | null>(null);
  return (
    <Form
      class="flex w-[360px] flex-col gap-4"
      validationErrors={errors()}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        if (formData.get('name') === 'admin') {
          setErrors({
            name: 'This name is already taken',
          });
        } else {
          setErrors(null);
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        }
      }}
    >
      <TextField name="name" label="Pet name" required />
      <Button type="submit" loading={loading()} class="ms-auto w-[7rem]">
        Submit
      </Button>
    </Form>
  );
};
