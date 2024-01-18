import { Title } from '@solidjs/meta';
import { A, createAsync, type RouteDefinition } from '@solidjs/router';
import { For, lazy, Match, Show, Switch } from 'solid-js';
import { ButtonLink, Card, Icon, Text } from '@nou/ui';

import { createTranslator, getDictionary } from '~/i18n';
import { AccountMenu } from '~/lib/account-menu';

import { getUserFamilyAndPets } from './_queries';

const CreateNewPetForm = lazy(() => import('~/lib/create-new-pet-form'));

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
              <AccountMenu
                name={user().name || ''}
                avatarUrl={user().avatarUrl}
              />
            </header>
            <div class="flex flex-col gap-6">
              <section class="container">
                <Switch>
                  <Match when={user().pets.length === 0}>
                    <CreateNewPetForm minimal>
                      <Show when={!user().family}>
                        <A
                          href="/app/join"
                          class="bg-surface-container-high flex flex-row items-center justify-between gap-2 text-balance rounded-[inherit] p-4"
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
                      </Show>
                    </CreateNewPetForm>
                  </Match>
                  <Match when={user().pets.length > 0}>
                    <ul class="scrollbar-none -mx-3 snap-mandatory scroll-p-3 overflow-auto px-3 pb-2">
                      <For each={user().pets}>
                        {(pet) => (
                          <Card variant="flat">
                            <div class="flex flex-col gap-4">
                              <div class="flex flex-row gap-4">
                                <div class="bg-tertiary/10 -ms-2 -mt-2 size-24 rounded-md">
                                  Avatar
                                </div>
                                <Text with="body-lg">{pet.name}</Text>
                              </div>
                              Lazy loaded list of actions
                            </div>
                          </Card>
                        )}
                      </For>
                    </ul>
                  </Match>
                </Switch>
              </section>
            </div>
          </div>
        </>
      )}
    </Show>
  );
}

export default AppMainPage;
