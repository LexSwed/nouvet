import { Show } from 'solid-js';
import { Avatar, Button, Menu, MenuItem } from '@nou/ui';

interface AccountMenu {
  name: string;
  avatarUrl: string | null;
}

const AccountMenu = (props: AccountMenu) => {
  return (
    <div>
      <Button popoverTarget="menu" variant="ghost" icon>
        <Avatar name={props.name} avatarUrl={props.avatarUrl} />
      </Button>
      <Menu id="menu" placement="bottom-end">
        <MenuItem>Account</MenuItem>
        <MenuItem>Install for offline</MenuItem>
        <MenuItem>Log Out</MenuItem>
      </Menu>
    </div>
  );
};

export { AccountMenu };
