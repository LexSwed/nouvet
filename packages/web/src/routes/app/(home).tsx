import { Title } from '@solidjs/meta';
import {
  createAsync,
  type RouteDefinition,
  type RouteSectionProps,
} from '@solidjs/router';
import { clientOnly } from '@solidjs/start';
import { Show, Suspense } from 'solid-js';
import { Button, ButtonLink } from '@nou/ui';

import { getUserFamily } from '~/server/api/user';
import { cacheTranslations, createTranslator } from '~/server/i18n';

import { AccountMenu } from '~/lib/account-menu';

const FamilyInviteDialog = clientOnly(
  () => import('~/lib/family-invite-dialog'),
);

export const route = {
  load() {
    return Promise.all([cacheTranslations('app'), getUserFamily()]);
  },
} satisfies RouteDefinition;

function AppMainPage(props: RouteSectionProps) {
  const t = createTranslator('app');
  const user = createAsync(() => getUserFamily());
  return (
    <Show when={user()}>
      {(user) => (
        <>
          <Title>
            <Show
              when={user().family?.name}
              children={t('meta.title', {
                familyName: user().family!.name!,
              })}
              fallback={t('meta.title-new-user')}
            />
          </Title>
          <div class="bg-background min-h-full">
            <header class="align-center flex justify-between p-4">
              <Show
                when={user().family}
                children={
                  <ButtonLink href={`/app/${user().family?.id}`} variant="link">
                    {user().family?.name
                      ? user().family?.name
                      : t('my-family-cta')}
                  </ButtonLink>
                }
                fallback={
                  <>
                    <Button popoverTarget="family-invite" variant="link">
                      {t('my-family-cta')}
                    </Button>
                    <Suspense>
                      <FamilyInviteDialog id="family-invite" />
                    </Suspense>
                  </>
                }
              />
              <AccountMenu
                name={user().name || ''}
                avatarUrl={user().avatarUrl}
              />
            </header>
            <div class="flex flex-col gap-6">
              <section class="container">
                <Suspense>{props.children}</Suspense>
              </section>
            </div>
          </div>
        </>
      )}
    </Show>
  );
}

export default AppMainPage;
