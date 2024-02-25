import { A } from '@solidjs/router';
import {
  Avatar,
  Button,
  Divider,
  Icon,
  MenuItem,
  MenuList,
  Popover,
  Text,
} from '@nou/ui';

import { createTranslator } from '~/server/i18n';

interface AccountMenu {
  name: string;
  avatarUrl: string | null;
}

const AccountMenu = (props: AccountMenu) => {
  const t = createTranslator('app');
  return (
    <>
      <Button popoverTarget="account-menu" variant="ghost" icon>
        <Avatar name={props.name} avatarUrl={props.avatarUrl} />
      </Button>
      <Popover
        id="account-menu"
        placement="bottom-end"
        class="bg-surface flex max-h-96 w-[15rem] flex-col rounded-3xl p-2"
      >
        <div class="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 px-3 py-4 pt-2">
          <Avatar
            name={props.name}
            avatarUrl={props.avatarUrl}
            class="size-8"
          />
          <Text with="label">{props.name}</Text>
        </div>
        <MenuList class="bg-surface flex flex-col rounded-2xl">
          <MenuItem as={A} href="/profile">
            <Icon use="user-circle" size="sm" />
            {t('account-menu.account')}
          </MenuItem>
          <MenuItem class="gap-2">
            <Icon use="install" size="sm" />
            Install for offline
          </MenuItem>
          <MenuItem as={A} href="/help">
            <Icon use="support" size="sm" />
            Support
          </MenuItem>
          <Divider role="separator" class="my-2" />
          <MenuItem as={A} href="/logout">
            <Icon use="sign-out" size="sm" />
            Log Out
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
};

export { AccountMenu };
