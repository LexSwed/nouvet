import { Title } from '@solidjs/meta';
import { A, createAsync, type RouteDefinition } from '@solidjs/router';
import { Match, Show, Switch } from 'solid-js';
import { Avatar, ButtonLink, Icon } from '@nou/ui';

import { createTranslator, getDictionary } from '~/i18n';
import { CreateNewPetForm } from '../../lib/create-new-pet-form';

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
                <Switch>
                  <Match when={!user().family && user().pets.length === 0}>
                    <CreateNewPetForm minimal>
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
                    </CreateNewPetForm>
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
