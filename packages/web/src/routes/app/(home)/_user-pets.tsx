import { A, createAsync } from '@solidjs/router';
import { For, lazy, Match, Show, Switch } from 'solid-js';
import { Button, Icon } from '@nou/ui';

import { createTranslator } from '~/server/i18n';
import { getUserPets } from '~/api/pet';

import { PetHomeCard } from './_pet-home-card';

const CreateNewPetForm = lazy(() => import('~/lib/create-new-pet-form'));

export const UserPets = (props: { familyId: number | undefined }) => {
  const t = createTranslator('app');
  const pets = createAsync(() => getUserPets());
  return (
    <Switch>
      <Match when={pets()?.length ?? 0 > 0}>
        <ul class="overflow-snap -mx-4 -my-2 flex scroll-px-4 flex-row items-center gap-2 px-4 py-2">
          <For each={pets()}>
            {(pet) => (
              <li>
                <PetHomeCard pet={pet} />
              </li>
            )}
          </For>
          <li>
            <Button size="cta" icon variant="ghost">
              <Icon use="plus-circle" size="md" />
            </Button>
          </li>
        </ul>
      </Match>
      <Match when={pets()?.length === 0}>
        <CreateNewPetForm minimal>
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
        </CreateNewPetForm>
      </Match>
    </Switch>
  );
};
