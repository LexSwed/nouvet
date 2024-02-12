import { A, createAsync } from '@solidjs/router';
import { clientOnly } from '@solidjs/start';
import { For, lazy, Match, Show, Switch } from 'solid-js';
import { Button, Card, Icon } from '@nou/ui';

import { createTranslator } from '~/server/i18n';
import { getUserPets } from '~/api/pet';

import { PetHomeCard } from './_pet-home-card';

const CreateNewPetForm = lazy(() => import('~/lib/create-new-pet-form'));
const Drawer = clientOnly(() =>
  import('@nou/ui').then((ui) => ({ default: ui.Drawer })),
);

export const UserPets = (props: { familyId: number | undefined }) => {
  const t = createTranslator('app');
  const pets = createAsync(() => getUserPets());
  return (
    <Switch>
      <Match when={pets()?.length ?? 0 > 0}>
        <ul class="overflow-snap -mx-4 -my-2 flex scroll-px-4 flex-row items-center gap-4 px-4 py-2">
          <For each={pets()}>
            {(pet) => (
              <li class="block">
                <PetHomeCard pet={pet} />
              </li>
            )}
          </For>
          <li>
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
              <CreateNewPetForm
                onSuccess={() => {
                  document
                    .getElementById('create-new-pet-drawer')
                    ?.hidePopover();
                }}
              />
            </Drawer>
          </li>
        </ul>
      </Match>
      <Match when={pets()?.length === 0}>
        <Card class="flex flex-col gap-6 p-4">
          <CreateNewPetForm />
          <Show when={!props.familyId}>
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
