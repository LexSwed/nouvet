import { A, createAsync, type RouteDefinition } from '@solidjs/router';
import { clientOnly } from '@solidjs/start';
import { For, lazy, Match, Show, Suspense, Switch } from 'solid-js';
import { Button, Card, Icon } from '@nou/ui';

import { getUserPets } from '~/server/api/pet';
import { getUserFamily } from '~/server/api/user';
import { cacheTranslations, createTranslator } from '~/server/i18n';

import { PetHomeCard } from '~/lib/pet-home-card';

const CreateNewPetForm = lazy(() => import('~/lib/create-new-pet-form'));
const Drawer = clientOnly(() =>
  import('@nou/ui').then((ui) => ({ default: ui.Drawer })),
);

export const route = {
  load() {
    return Promise.all([
      cacheTranslations('app'),
      getUserPets(),
      getUserFamily(),
    ]);
  },
} satisfies RouteDefinition;

const AppHomePage = () => {
  return <UserPets />;
};

export default AppHomePage;

const UserPets = () => {
  const t = createTranslator('app');
  const pets = createAsync(() => getUserPets());
  console.log(pets());
  const user = createAsync(() => getUserFamily());
  const hasPets = () => (pets()?.length ?? 0) > 0;
  return (
    <Switch>
      <Match when={hasPets()}>
        <ul class="overflow-snap -mx-4 -my-2 flex scroll-px-4 flex-row items-stretch gap-4 px-4 py-2">
          <For each={pets()}>
            {(pet) => (
              <li>
                <PetHomeCard pet={pet} />
              </li>
            )}
          </For>
          <li class="self-center">
            <Button
              label={t('add-another')}
              size="base"
              class="bg-on-surface/5"
              icon
              variant="ghost"
              popoverTarget="create-new-pet-drawer"
            >
              <Icon use="plus" size="sm" />
            </Button>
            <Drawer
              id="create-new-pet-drawer"
              placement="center"
              role="dialog"
              class="max-w-[420px]"
            >
              {(open) => (
                <Show when={open()}>
                  <Suspense>
                    <CreateNewPetForm
                      onSuccess={() => {
                        document
                          .getElementById('create-new-pet-drawer')
                          ?.hidePopover();
                      }}
                    />
                  </Suspense>
                </Show>
              )}
            </Drawer>
          </li>
        </ul>
      </Match>
      <Match when={!hasPets()}>
        <Card class="flex flex-col gap-6 p-4">
          <CreateNewPetForm />
          <Show when={!user()?.family?.id}>
            <A
              href="/app/join"
              class="bg-surface-container-high flex flex-row items-center justify-between gap-2 text-balance rounded-[inherit] p-4"
            >
              <h3 class="text-primary text-sm">{t('invite-card-heading')}</h3>
              <Icon
                use="arrow-circle-up-right"
                class="text-primary"
                size="sm"
              />
            </A>
          </Show>
        </Card>
      </Match>
    </Switch>
  );
};
