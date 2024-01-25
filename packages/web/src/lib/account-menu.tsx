import { A } from '@solidjs/router';
import {
  Avatar,
  Button,
  Divider,
  Icon,
  MenuItem,
  MenuList,
  Text,
} from '@nou/ui';
import { Popover } from '@nou/ui/src/popover';

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
        class="flex max-h-96 w-[15rem] flex-col gap-3 p-2"
      >
        <div class="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 p-3">
          <Avatar
            name={props.name}
            avatarUrl={props.avatarUrl}
            class="size-8"
          />
          <Text with="label">{props.name}</Text>
        </div>
        <Divider class="-mx-2" />
        <MenuList class="flex flex-col gap-2">
          <MenuItem role="presentation" class="rounded-md p-0">
            <A
              href="/profile"
              role="menuitem"
              class="flex w-full flex-row items-center gap-2 p-2 outline-none"
            >
              <Icon use="user-circle" size="sm" />
              {t('app.account-menu.account')}
            </A>
          </MenuItem>
          <MenuItem class="gap-2 rounded-md">
            <Icon use="install" size="sm" class="-ms-1" />
            Install for offline
          </MenuItem>
          <MenuItem role="presentation" class="rounded-md p-0">
            <A
              href="/help"
              role="menuitem"
              class="flex w-full flex-row items-center gap-2 p-2 outline-none"
            >
              <Icon use="support" size="sm" />
              Support
            </A>
          </MenuItem>
          <Divider class="-mx-2" role="separator" />
          <MenuItem role="presentation" class="rounded-md p-0">
            <A
              href="/logout"
              role="menuitem"
              class="flex w-full flex-row items-center gap-2 p-2 outline-none"
            >
              <Icon use="sign-out" size="sm" />
              Log Out
            </A>
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
};

export { AccountMenu };
