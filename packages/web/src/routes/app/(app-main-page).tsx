import { Title } from '@solidjs/meta';
import { A, createAsync, type RouteDefinition } from '@solidjs/router';
import { Show } from 'solid-js';
import { Avatar, ButtonLink, Card, Icon, TextField } from '@nou/ui';

import { createTranslator, getDictionary } from '~/i18n';

import { getUserFamilyAndPets } from './_queries';

export const route = {
  load() {
    getDictionary('app');
    getUserFamilyAndPets();
  },
} satisfies RouteDefinition;

function AppMainPage() {
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
                familyName: user().family!.name!,
              })}
              fallback={t('app.meta.title-new-user')}
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
                    {t('app.my-family-cta')}
                  </ButtonLink>
                }
              />
              <Avatar name={user().name || ''} avatarUrl={user().avatarUrl} />
            </header>
            <div class="flex flex-col gap-6">
              <section class="container">
                <Card class="p-0">
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
                        <h3 class="text-primary text-sm">
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
