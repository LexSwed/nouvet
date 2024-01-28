import { A, createAsync } from '@solidjs/router';
import { For, lazy, Match, Show, Switch } from 'solid-js';
import { Button, Icon } from '@nou/ui';

import { getUserPets } from '~/api/pet';
import { PetHomeCard } from '~/lib/pet-home-card';
import { createTranslator } from '~/server/i18n';

const CreateNewPetForm = lazy(() => import('~/lib/create-new-pet-form'));

export const UserPets = (props: { familyId: number | undefined }) => {
  const t = createTranslator('app');
  const pets = createAsync(() => getUserPets());
  return (
    <Switch>
      <Match when={pets()?.length ?? 0 > 0}>
        <>
          <ul class="scrollbar-none -mx-3 grid snap-x snap-mandatory scroll-p-3 grid-flow-col grid-cols-[repeat(auto-fit,100%)] gap-2 overflow-auto px-3 py-2 [&>*]:snap-start">
            <For each={pets()}>{(pet) => <PetHomeCard pet={pet} />}</For>
          </ul>
          <Button variant="ghost" class="w-full">
            Add More
          </Button>
        </>
      </Match>
      <Match when={pets()?.length === 0}>
        <CreateNewPetForm minimal>
          <Show when={!props.familyId}>
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
    </Switch>
  );
};
