import { Title } from '@solidjs/meta';
import { createAsync, type RouteDefinition } from '@solidjs/router';
import { Show, Suspense } from 'solid-js';
import { ButtonLink } from '@nou/ui';

import { cacheTranslations, createTranslator } from '~/server/i18n';
import { getUserPets } from '~/api/pet';
import { getUserFamily } from '~/api/user';

import { AccountMenu } from '~/lib/account-menu';

import { UserPets } from './_user-pets';

export const route = {
  load() {
    return Promise.all([
      cacheTranslations('app'),
      getUserFamily(),
      getUserPets(),
    ]);
  },
} satisfies RouteDefinition;

function AppMainPage() {
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
                    {user().family?.name}
                  </ButtonLink>
                }
                fallback={
                  <ButtonLink href={`/app/family`} variant="link">
                    {t('my-family-cta')}
                  </ButtonLink>
                }
              />
              <AccountMenu
                name={user().name || ''}
                avatarUrl={user().avatarUrl}
              />
            </header>
            <div class="flex flex-col gap-6">
              <section class="container">
                <Suspense>
                  <UserPets />
                </Suspense>
              </section>
            </div>
          </div>
        </>
      )}
    </Show>
  );
}

export default AppMainPage;
