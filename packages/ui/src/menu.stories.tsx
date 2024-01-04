import { type Meta } from 'storybook-solidjs';
import { Avatar } from './avatar';
import { Menu, MenuItem, MenuTrigger } from './menu';

const meta = {
  title: 'Menu',
  component: Menu,
  argTypes: {},
} satisfies Meta<typeof Menu>;

export default meta;

export const SimpleMenu = () => {
  return (
    <>
      <MenuTrigger popoverTarget="menu-popup" variant="ghost" icon>
        <Avatar name="John Doe" avatarUrl={null} />
      </MenuTrigger>
      <Menu id="menu-popup" placement="bottom-start">
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
      <MenuTrigger popoverTarget="menu-popup">Open menu</MenuTrigger>
      <Menu id="menu-popup">
        {(open) => (open() ? <AsyncOrHeavyComponent /> : null)}
      </Menu>
    </>
  );
};
