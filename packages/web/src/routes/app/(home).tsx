import { Title } from '@solidjs/meta';
import {
  createAsync,
  type RouteDefinition,
  type RouteSectionProps,
} from '@solidjs/router';
import { Match, Show, Suspense, Switch } from 'solid-js';
import { Button, ButtonLink } from '@nou/ui';

import { getUserFamily } from '~/server/api/user';
import { cacheTranslations, createTranslator } from '~/server/i18n';

import { AppHeader } from '~/lib/app-header';
import FamilyInviteDialog from '~/lib/family-invite/invite-dialog';

export const route = {
  load() {
    return Promise.all([cacheTranslations('app'), getUserFamily()]);
  },
} satisfies RouteDefinition;

function AppMainPage(props: RouteSectionProps) {
  const t = createTranslator('app');
  const user = createAsync(() => getUserFamily());
  return (
    <>
      <Title>
        <Show when={user()?.family?.name} fallback={t('meta.title-new-user')}>
          {(familyName) => (
            <>
              {t('meta.title', {
                familyName: familyName(),
              })}
            </>
          )}
        </Show>
      </Title>
      <div class="bg-background min-h-full">
        <AppHeader>
          <Suspense>
            <Show when={user()}>
              {(user) => (
                <Switch>
                  <Match when={!user().family?.id}>
                    <>
                      <Button popoverTarget="family-invite" variant="link">
                        {t('family.no-name')}
                      </Button>
                      <Suspense>
                        <FamilyInviteDialog id="family-invite" />
                      </Suspense>
                    </>
                  </Match>
                  <Match when={user().family?.id}>
                    <ButtonLink
                      href={`/app/family`}
                      variant="ghost"
                      tone="primary"
                    >
                      {user().family?.name
                        ? user().family!.name
                        : t('family.no-name')}
                    </ButtonLink>
                  </Match>
                </Switch>
              )}
            </Show>
          </Suspense>
        </AppHeader>
        <div class="flex flex-col gap-6">
          <section class="container">
            <Suspense>{props.children}</Suspense>
          </section>
        </div>
      </div>
    </>
  );
}

export default AppMainPage;
