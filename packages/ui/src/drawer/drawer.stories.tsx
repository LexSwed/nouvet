import type { Meta } from 'storybook-solidjs';

import { Button } from '../button';
import { Form } from '../form';
import { TextField } from '../text-field';

import { Drawer } from './drawer';

const meta = {
  title: 'Drawer',
  // @ts-expect-error types mismatch
  component: Drawer.Root,
  argTypes: {},
} satisfies Meta<typeof Drawer>;

export default meta;

export const AnimalShortcut = () => {
  return (
    <Drawer.Root>
      <Drawer.Trigger popoverTarget="weight" variant="secondary">
        Add pet's weight info
      </Drawer.Trigger>
      <Drawer.Content id="weight">
        <Form
          class="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            console.log(e.currentTarget.checkValidity());
          }}
          data-corvu-no-drag
        >
          <TextField
            label="Weight"
            type="number"
            inputMode="numeric"
            step="0.1"
          />
          <div class="flex flex-row gap-2 self-end">
            <Button
              variant="ghost"
              popoverTargetAction="hide"
              popoverTarget="weight"
            >
              Later
            </Button>
            <Button>Save</Button>
          </div>
        </Form>
      </Drawer.Content>
    </Drawer.Root>
  );
};
