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
          <MenuItem role="presentation" class="p-0">
            <A
              href="/profile"
              role="menuitem"
              class="flex w-full flex-row items-center gap-2 p-3 outline-none"
            >
              <Icon use="user-circle" size="sm" />
              {t('account-menu.account')}
            </A>
          </MenuItem>
          <MenuItem class="gap-2">
            <Icon use="install" size="sm" />
            Install for offline
          </MenuItem>
          <MenuItem role="presentation" class="p-0">
            <A
              href="/help"
              role="menuitem"
              class="flex w-full flex-row items-center gap-2 p-3 outline-none"
            >
              <Icon use="support" size="sm" />
              Support
            </A>
          </MenuItem>
          <Divider role="separator" class="my-2" />
          <MenuItem role="presentation" class="p-0">
            <A
              href="/logout"
              role="menuitem"
              class="flex w-full flex-row items-center gap-2 p-3 outline-none"
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
