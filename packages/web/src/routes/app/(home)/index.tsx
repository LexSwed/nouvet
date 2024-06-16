import { createAsync, type RouteDefinition } from '@solidjs/router';
import { clientOnly } from '@solidjs/start';
import {
  createUniqueId,
  For,
  lazy,
  Match,
  Show,
  Suspense,
  Switch,
} from 'solid-js';
import { Button, Card, Icon } from '@nou/ui';

import { getUserPets } from '~/server/api/pet';
import { getUserFamily } from '~/server/api/user';
import { cacheTranslations, createTranslator } from '~/server/i18n';

import FamilyInviteDialog from '~/lib/family-invite/invite-dialog';
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
  return (
    <>
      <UserPets />
    </>
  );
};

export default AppHomePage;

const UserPets = () => {
  const headingId = createUniqueId();

  const t = createTranslator('app');
  const pets = createAsync(() => getUserPets());
  const user = createAsync(() => getUserFamily());
  const hasPets = () => (pets()?.length ?? 0) > 0;

  return (
    <Switch>
      <Match when={hasPets()}>
        <div>
          <h2 id={headingId} class="sr-only">
            {t('pet-list')}
          </h2>
          <ul
            class="overflow-snap -mx-4 -my-2 flex scroll-px-4 flex-row items-stretch gap-4 px-4 py-2"
            aria-labelledby={headingId}
          >
            <For each={pets()}>
              {(pet) => (
                <li>
                  <PetHomeCard
                    pet={pet}
                    owner={user()?.id === pet.owner?.id ? undefined : pet.owner}
                  />
                </li>
              )}
            </For>
            <li class="self-center">
              <Button
                label={t('add-another')}
                size="base"
                icon
                variant="tonal"
                popoverTarget="create-new-pet-drawer"
              >
                <Icon use="plus" size="sm" />
              </Button>
              <Drawer
                id="create-new-pet-drawer"
                placement="center"
                role="dialog"
                class="md:max-w-[420px]"
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
        </div>
      </Match>
      <Match when={!hasPets()}>
        <Card class="flex max-w-[460px] flex-col gap-6 p-4">
          <CreateNewPetForm
            onSuccess={(pet) => {
              document.getElementById(`pet-${pet.id}`)?.focus();
            }}
          />
          <Show when={!user()?.family}>
            <Button
              popoverTarget="newjoiner-join-family"
              variant="tonal"
              tone="primary"
              class="justify-between gap-2 rounded-2xl p-4 text-start font-normal"
            >
              {t('invite-card-heading')}
              <Icon
                use="arrow-circle-up-right"
                class="text-on-primary-container"
                size="sm"
              />
            </Button>
            <FamilyInviteDialog
              initialScreen="join"
              id="newjoiner-join-family"
            />
          </Show>
        </Card>
      </Match>
    </Switch>
  );
};
