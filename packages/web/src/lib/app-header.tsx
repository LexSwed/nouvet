import { createAsync } from '@solidjs/router';
import { Show, type ParentProps } from 'solid-js';

import { getUserFamily } from '~/server/api/user';

import { AccountMenu } from './account-menu';

export const AppHeader = (props: ParentProps) => {
  const user = createAsync(() => getUserFamily());

  return (
    <Show when={user()}>
      {(user) => (
        <header class="container flex items-center justify-between gap-8 py-4">
          {props.children}
          <AccountMenu name={user().name || ''} avatarUrl={user().avatarUrl!} />
        </header>
      )}
    </Show>
  );
};
