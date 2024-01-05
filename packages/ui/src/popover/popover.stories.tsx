import { type Meta } from 'storybook-solidjs';
import { Avatar } from '../avatar';
import { Button, ButtonLink } from '../button';
import { MenuList, MenuItem } from '../menu';
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
