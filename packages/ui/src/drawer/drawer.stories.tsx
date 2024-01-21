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
      {() => (
        <>
          <Drawer.Trigger>Open Drawer</Drawer.Trigger>
          <Drawer.Content>
            <Form class="flex flex-col gap-4" data-corvu-no-drag>
              <TextField label="Weight" />
              <Button>Save</Button>
            </Form>
          </Drawer.Content>
        </>
      )}
    </Drawer.Root>
  );
};
