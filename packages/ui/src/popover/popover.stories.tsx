import { type Meta } from 'storybook-solidjs';

import { Avatar } from '../avatar';
import { Button } from '../button';
import { Icon } from '../icon/icon';
import { MenuItem, MenuList } from '../menu';

import { Popover } from './popover';

const meta = {
  title: 'Popover',
  component: Popover,
  argTypes: {},
} satisfies Meta<typeof Popover>;

export default meta;

export const AccountMenu = () => {
  return (
    <div class="flex size-full justify-end">
      <Button popoverTarget="settings" variant="ghost" icon>
        <Avatar name="John Doe" avatarUrl={null} />
      </Button>
      <Popover
        id="settings"
        placement="bottom-end"
        offset={(state) => ({
          mainAxis: -(state.elements.reference as HTMLElement).offsetWidth - 12,
          crossAxis: 12,
        })}
        class="flex w-[240px] flex-col gap-4"
      >
        <a
          href="#"
          link={false}
          class="flex w-full items-center justify-start gap-4 ps-3 text-primary"
        >
          John Doe
          <Avatar name="John Doe" class="ms-auto" avatarUrl={null} />
        </a>
        <MenuList>
          <MenuItem>Account</MenuItem>
          <MenuItem>Install for offline</MenuItem>
          <MenuItem>Log Out</MenuItem>
        </MenuList>
      </Popover>
    </div>
  );
};

export const ContextualHelp = () => {
  return (
    <div class="flex size-full items-center justify-center">
      <Button aria-label="Info" popoverTarget="info" variant="ghost" icon>
        <Icon use="info" size="md" />
      </Button>
      <Popover
        role="dialog"
        id="info"
        aria-labelledby="info-heading"
        class="w-[300px]"
        placement="top"
      >
        <h2 id="info-heading" class="text-lg">
          How this is used?
        </h2>
        <p class="mt-2 text-sm">
          The ID is only used for quick verification of the attending animal. It
          cannot be used as an official document.
        </p>
      </Popover>
    </div>
  );
};
