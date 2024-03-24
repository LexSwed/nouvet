import { Title } from '@solidjs/meta';
import {
  createAsync,
  type RouteDefinition,
  type RouteSectionProps,
} from '@solidjs/router';
import { clientOnly } from '@solidjs/start';
import { Match, Show, Suspense, Switch } from 'solid-js';
import { Button, ButtonLink, Card, Icon, Text } from '@nou/ui';

import { getUserFamily } from '~/server/api/user';
import { cacheTranslations, createTranslator } from '~/server/i18n';

import { AccountMenu } from '~/lib/account-menu';

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
        <AppHeader />
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

const FamilyInviteDialog = clientOnly(
  () => import('~/lib/family-invite-dialog'),
);

const AppHeader = () => {
  const t = createTranslator('app');
  const user = createAsync(() => getUserFamily());

  return (
    <Show when={user()}>
      {(user) => (
        <header class="align-center flex justify-between gap-8 p-4">
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
            <Match
              when={
                user().family.id &&
                !user().family.isOwner &&
                !user().family.isApproved
              }
            >
              <Card
                variant="filled"
                class="flex max-w-[380px] flex-col p-0 pt-2"
              >
                <ButtonLink
                  href={`/app/${user().family?.id}`}
                  variant="link"
                  class="flex flex-row items-center justify-between gap-4"
                >
                  {t('family.no-name')}
                  <Icon
                    use="nouvet"
                    size="md"
                    class="text-on-primary-container"
                  />
                </ButtonLink>
                <Text class="p-6 pt-0">{t('family.joined')}</Text>
              </Card>
            </Match>
            <Match when={user().family?.id}>
              <div class="flex flex-row items-center gap-1">
                <ButtonLink
                  href={`/app/${user().family?.id}`}
                  variant="ghost"
                  class="text-primary intent:bg-primary/5 gap-2 rounded-full px-2"
                >
                  {user().family?.name
                    ? user().family?.name
                    : t('family.no-name')}
                  <Show when={user().family.waitingApproval > 0}>
                    {
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      (_) => {
                        const multiple = user().family.waitingApproval > 1;
                        const title = multiple
                          ? t('family.has-pending-multiple', {
                              pendingNumber: user().family.waitingApproval,
                            })
                          : t('family.has-pending-one');
                        return (
                          <Text
                            title={title}
                            aria-label={title}
                            class="bg-primary-container text-on-primary-container grid aspect-square size-8 place-items-center rounded-full text-sm"
                          >
                            {user().family.waitingApproval}
                          </Text>
                        );
                      }
                    }
                  </Show>
                </ButtonLink>
              </div>
            </Match>
          </Switch>
          <AccountMenu name={user().name || ''} avatarUrl={user().avatarUrl!} />
        </header>
      )}
    </Show>
  );
};
