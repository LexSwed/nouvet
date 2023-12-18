import { Title } from '@solidjs/meta';
import {
  createAsync,
  type RouteDefinition,
  type RouteSectionProps,
} from '@solidjs/router';
import { Show } from 'solid-js';
import { createTranslator, getDictionary } from '~/i18n';
import { LogoLink } from '~/lib/logo-link';
import { Avatar } from '~/lib/ui/avatar';
import { ButtonLink } from '~/lib/ui/button';
import { Card, NavCard } from '~/lib/ui/card';
import { getUserFamilyAndPets } from '~/server/api/getUserFamilyAndPets';

export const route = {
  load() {
    getDictionary('app');
    getUserFamilyAndPets();
  },
} satisfies RouteDefinition;

function AppMainPage(props: RouteSectionProps) {
  const t = createTranslator('app');
  const user = createAsync(() => getUserFamilyAndPets());

  const userName = () => user()?.name || '';

  return (
    <Show when={user()}>
      {(user) => (
        <>
          <Title>
            {user().family
              ? t('app.meta.title', { familyName: user().family?.name! })
              : t('app.meta.title-new-user')}
          </Title>
          <div class="min-h-full">
            <header class="align-center flex justify-between px-4 py-4">
              <Show
                when={user().family}
                children={
                  <ButtonLink href={`/app/${user().family?.id}`} variant="link">
                    {user().family?.name}
                  </ButtonLink>
                }
                fallback={
                  <ButtonLink href={`/app/family`} variant="link">
                    {t('app.my-family-cta')}
                  </ButtonLink>
                }
              />
              <Avatar name={userName()} avatarUrl={user().avatarUrl} />
            </header>
            <section class="container">
              <NavCard
                href="/app/join"
                role="article"
                class="flex flex-col gap-4 p-6"
              >
                <h2 class="text-2xl">{t('app.invite-card-heading')}</h2>
                <p class="text-lg">{t('app.invite-card-description')}</p>
                <div class="-mb-3 -me-3 min-w-[theme(spacing.20)] self-end rounded-lg p-3 text-center text-primary transition-colors intent:bg-primary/10">
                  {t('app.cta-invite-join')}
                </div>
              </NavCard>
            </section>
          </div>
        </>
      )}
    </Show>
  );
}

export default AppMainPage;
