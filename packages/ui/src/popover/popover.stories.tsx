import { type Meta } from 'storybook-solidjs';

import { Avatar } from '../avatar';
import { Button, ButtonLink } from '../button';
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
    <div class="flex h-full w-full justify-end">
      <Button popoverTarget="settings" variant="ghost" icon>
        <Avatar name="John Doe" avatarUrl={null} />
      </Button>
      <Popover
        id="settings"
        placement="bottom-end"
        // offset={(state) => ({
        //   mainAxis:
        //     -1 * (state.elements.reference as HTMLElement).offsetHeight - 12,
        //   crossAxis: -12,
        // })}
        class="flex flex-col gap-4"
      >
        <ButtonLink
          variant="link"
          href="/"
          link={false}
          class="flex items-center justify-start gap-4 p-3"
        >
          <Avatar class="-ms-3" name="John Doe" avatarUrl={null} />
          John Doe
        </ButtonLink>
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
    <div class="flex h-full w-full items-center justify-center">
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
