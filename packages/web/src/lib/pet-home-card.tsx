import { A } from '@solidjs/router';
import { Match, Show, Switch } from 'solid-js';
import { Button, Card, Icon, Text } from '@nou/ui';

import type { DatabasePet } from '~/server/db/schema';
import { createTranslator } from '~/server/i18n';

import AddBirthDateForm from './add-birthdate-form';
import AddBreedForm from './add-pet-breed';
import AddWeightForm from './add-weight-form';
import { makePersistedSetting } from './make-persisted-signal';

interface PetHomeCardProps {
  pet: {
    id: number;
    pictureUrl: string | null;
    name: string;
    type: DatabasePet['type'];
    gender: DatabasePet['gender'];
    breed: string | null;
    dateOfBirth: string | null;
    color: string | null;
    weight: number | null;
  };
}

export const PetHomeCard = (props: PetHomeCardProps) => {
  return (
    <Card variant="flat" class="inline-flex flex-col gap-4">
      <A
        href={`/app/pet/${props.pet.id}/`}
        class="-m-4 flex flex-row items-center gap-4 p-3"
      >
        <div class="bg-tertiary/10 text-tertiary grid size-16 shrink-0 place-content-center rounded-full">
          <Show
            when={props.pet.pictureUrl}
            children={
              <img
                src={props.pet.pictureUrl!}
                class="aspect-square w-full"
                alt=""
              />
            }
            fallback={<Icon use="camera-plus" size="md" />}
          />
        </div>
        <div class="flex flex-row items-center gap-2">
          <Text with="body-lg">{props.pet.name}</Text>
          <Button icon variant="ghost" size="sm" aria-hidden tabIndex={-1}>
            <Icon use="pencil" size="sm" />
          </Button>
        </div>
      </A>
      <QuickSetters pet={props.pet} />
    </Card>
  );
};

function QuickSetters(props: PetHomeCardProps) {
  const t = createTranslator('pet-forms');

  const [qs, toggle] = makePersistedSetting('qs-toggles', {
    showBirthDate: !props.pet.dateOfBirth,
    showWeight: !props.pet.weight,
    showBreed: !props.pet.breed && props.pet.type === 'dog',
  });

  return (
    <ul class="overflow-snap -mx-4 grid scroll-p-4 grid-flow-col justify-start gap-2 px-4 [grid-auto-columns:min-content] empty:hidden">
      <Switch>
        <Match when={qs()?.showBirthDate}>
          <li class="contents">
            <Button
              variant="outline"
              size="sm"
              class="gap-2 text-nowrap"
              popoverTarget={`${props.pet.id}-birth-date`}
            >
              <Icon use="calendar-plus" size="sm" />
              <Text with="label-sm">{t('animal-shortcut.birth-date')}</Text>
            </Button>
            <AddBirthDateForm
              id={`${props.pet.id}-birth-date`}
              pet={props.pet}
              onDismiss={() =>
                toggle((old) => ({ ...old, showBirthDate: false }))
              }
            />
          </li>
        </Match>
        <Match when={qs()?.showWeight}>
          <li class="contents">
            <Button
              variant="outline"
              size="sm"
              class="gap-2 text-nowrap"
              popoverTarget={`${props.pet.id}-weight`}
            >
              <Icon use="scales" size="sm" />
              <Text with="label-sm">{t('animal-shortcut.weight')}</Text>
            </Button>
            <AddWeightForm
              id={`${props.pet.id}-weight`}
              pet={props.pet}
              onDismiss={() => toggle((old) => ({ ...old, showWeight: false }))}
            />
          </li>
        </Match>
        <Match when={qs()?.showBreed}>
          <li class="contents">
            <Button
              variant="outline"
              size="sm"
              class="gap-2 text-nowrap"
              popoverTarget={`${props.pet.id}-breed`}
            >
              <Icon use="paw-print" size="sm" />
              <Text with="label-sm">{t('animal-shortcut.breed')}</Text>
            </Button>
            <AddBreedForm
              id={`${props.pet.id}-breed`}
              pet={props.pet}
              onDismiss={() => toggle((old) => ({ ...old, showBreed: false }))}
            />
          </li>
        </Match>
      </Switch>
    </ul>
  );
}
