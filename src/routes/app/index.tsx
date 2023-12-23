import { Title } from '@solidjs/meta';
import {
  A,
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
                <Card variant="outlined" class="p-0">
                  <div class="flex flex-col gap-4 p-4 ">
                    <h3 class="text-2xl">{t('app.new-pet-heading')}</h3>
                    <TextField
                      label={t('app.new-pet-text-field-label')}
                      placeholder={t('app.new-pet-text-field-placeholder')}
                    />
                  </div>
                  <Show when={!user().family && user().pets.length === 0}>
                    <>
                      <hr class="border-outline/20" />
                      <A
                        href="/app/join"
                        class="-m-[1px] flex flex-row items-center justify-between gap-2 text-balance bg-primary-container p-4 shadow-[0_0_1px_theme(colors.primary)]"
                      >
                        <h3 class="text-base">
                          {t('app.invite-card-heading')}
                        </h3>
                        <Icon
                          icon={ArrowCircleUpRight}
                          class="text-primary"
                          size="sm"
                        />
                      </A>
                    </>
                  </Show>
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
