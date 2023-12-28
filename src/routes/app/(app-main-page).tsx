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
import { Card } from '~/lib/ui/card';
import { Icon } from '~/lib/ui/icon';

import { TextField } from '~/lib/ui/text-field/text-field';
import { getUserFamilyAndPets } from './_queries';

export const route = {
  load() {
    getDictionary('app');
    getUserFamilyAndPets();
  },
} satisfies RouteDefinition;

function AppMainPage(props: RouteSectionProps) {
  const t = createTranslator('app');
  const user = createAsync(() => getUserFamilyAndPets());

  return (
    <Show when={user()}>
      {(user) => (
        <>
          <Title>
            <Show
              when={user().family?.name}
              children={t('app.meta.title', {
                familyName: user().family?.name!,
              })}
              fallback={t('app.meta.title-new-user')}
            ></Show>
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
              <Avatar name={user().name || ''} avatarUrl={user().avatarUrl} />
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
                        class="flex flex-row items-center justify-between gap-2 text-balance rounded-b-[inherit] p-4"
                      >
                        <h3 class="text-sm text-primary">
                          {t('app.invite-card-heading')}
                        </h3>
                        <Icon
                          use="arrow-circle-up-right"
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