import { type Meta } from 'storybook-solidjs';
import { Avatar } from '../avatar';
import { Menu, MenuItem, MenuTrigger } from '.';

const meta = {
  title: 'Menu',
  component: Menu,
  argTypes: {},
} satisfies Meta<typeof Menu>;

export default meta;

export const SimpleMenu = () => {
  return (
    <>
      <MenuTrigger popoverTarget="menu" variant="ghost" icon>
        <Avatar name="John Doe" avatarUrl={null} />
      </MenuTrigger>
      <Menu id="menu" placement="bottom-start">
        <MenuItem>Account</MenuItem>
        <MenuItem>Install for offline</MenuItem>
        <MenuItem>Log Out</MenuItem>
      </Menu>
    </>
  );
};

export const LazyRender = () => {
  const AsyncOrHeavyComponent = () => {
    return <div>This won't be rendered until the popover is open</div>;
  };
  return (
    <>
      <MenuTrigger popoverTarget="menu">Open menu</MenuTrigger>
      <Menu id="menu">
        {(open) => (open() ? <AsyncOrHeavyComponent /> : null)}
      </Menu>
    </>
  );
};

export const WithoutAutoClosingOnItemClick = () => {
  const nope = (event: MouseEvent) => event.preventDefault();
  return (
    <>
      <MenuTrigger popoverTarget="menu" variant="ghost" icon>
        <Avatar name="John Doe" avatarUrl={null} />
      </MenuTrigger>
      <Menu id="menu" placement="bottom-end">
        <MenuItem onClick={nope}>Account</MenuItem>
        <MenuItem onClick={nope}>Install for offline</MenuItem>
        <MenuItem onClick={nope}>Log Out</MenuItem>
      </Menu>
    </>
  );
};
