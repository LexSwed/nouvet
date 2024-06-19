import {
  createAsync,
  type RouteDefinition,
  type RouteSectionProps,
} from '@solidjs/router';
import { Show, Suspense } from 'solid-js';
import { Avatar, Card, TextField } from '@nou/ui';

import { getUserProfile } from '~/server/api/user';
import { cacheTranslations, createTranslator } from '~/server/i18n';

import { AppHeader } from '~/lib/app-header';

export const route = {
  load() {
    void cacheTranslations('app');
    void getUserProfile();
  },
} satisfies RouteDefinition;

export default function ProfilePage(_props: RouteSectionProps) {
  const t = createTranslator('app');

  const user = createAsync(() => getUserProfile());

  return (
    <div class="bg-background min-h-full">
      <AppHeader backLink />
      <section class="container">
        <Suspense>
          <Show when={user()}>
            {(user) => (
              <Card variant="outlined" class="max-w-96">
                <div class="flex flex-row items-center gap-4">
                  <TextField
                    label="Name"
                    value={user().name ?? ''}
                    class="flex-[2]"
                  />
                  <Avatar
                    avatarUrl={user().avatarUrl}
                    name={user().name || ''}
                  />
                </div>
              </Card>
            )}
          </Show>
        </Suspense>
      </section>
    </div>
  );
}
