import { Title } from '@solidjs/meta';
import {
  createAsync,
  type RouteDefinition,
  type RouteSectionProps,
} from '@solidjs/router';
import { Show } from 'solid-js';
import { createTranslator, getDictionary } from '~/i18n';
import { Avatar } from '~/lib/ui/avatar';
import { ButtonLink } from '~/lib/ui/button';
import { Card, NavCard } from '~/lib/ui/card';
import { Icon } from '~/lib/ui/icon';
import { getUserFamilyAndPets } from '~/server/api/getUserFamilyAndPets';

import ArrowCircleUpRight from '~/assets/icons/arrow-circle-up-right.svg';
import { TextField } from '~/lib/ui/text-field/text-field';

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
          <div class="min-h-full bg-background">
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
            <div class="flex flex-col gap-6">
              <section class="container">
                <NavCard
                  href="/app/join"
                  role="article"
                  class="flex flex-row items-center justify-between p-4"
                >
                  <h3 class="text-base">{t('app.invite-card-heading')}</h3>
                  <Icon
                    icon={ArrowCircleUpRight}
                    class="text-primary"
                    size="sm"
                  />
                </NavCard>
              </section>
              <section class="container">
                <Card variant="flat" class="flex flex-col gap-4">
                  <h3 class="text-2xl">Your pet</h3>
                  <TextField label="Name" placeholder="Garfield" />
                </Card>
              </section>
            </div>
          </div>
        </>
      )}
    </Show>
  );
}

export default AppMainPage;
