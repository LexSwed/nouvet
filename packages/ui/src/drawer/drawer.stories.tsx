import type { Meta } from 'storybook-solidjs';

import { Button } from '../button';
import { Form } from '../form';
import { SegmentedButton } from '../radio';
import { Text } from '../text';
import { TextField } from '../text-field';

import { Drawer } from './drawer';

const meta = {
  title: 'Drawer',
  component: Drawer,
  argTypes: {},
} satisfies Meta<typeof Drawer>;

export default meta;

export const AnimalShortcut = () => {
  return (
    <>
      <Button popoverTarget="weight" variant="secondary">
        Add pet's weight info
      </Button>
      <Drawer id="weight" aria-labelledby="weight-popup-label">
        <span id="weight-popup-label" class="sr-only">
          Add pet's weight info
        </span>
        <Form
          class="flex flex-col gap-4 sm:min-w-[340px]"
          onSubmit={(e) => {
            e.preventDefault();
            console.log('valid!');
            // can be ref, can be #id access
            const popover = e.currentTarget.closest('[popover]');
            if (popover instanceof HTMLElement) {
              popover.hidePopover();
            }
          }}
        >
          <div class="flex items-center gap-4 self-end">
            <Text with="label-sm" as="label" for="weight-unit">
              Unit
            </Text>
            <fieldset id="weight-unit" class="grid grid-cols-2">
              <SegmentedButton name="unit" label="Lbs" />
              <SegmentedButton name="unit" label="Kg" />
            </fieldset>
          </div>
          <TextField
            label="Weight"
            type="number"
            inputMode="numeric"
            step="0.1"
            name="weight"
          />
          <div class="grid grid-cols-2 gap-2 sm:flex sm:self-end">
            <Button
              variant="ghost"
              popoverTargetAction="hide"
              popoverTarget="weight"
            >
              Later
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </Form>
      </Drawer>
    </>
  );
};
