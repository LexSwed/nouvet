import { A } from '@solidjs/router';
import { clientOnly } from '@solidjs/start';
import { Match, Show, Switch } from 'solid-js';
import { Button, Card, Icon, SplitButton, Text, type SvgIcons } from '@nou/ui';

import type { DatabasePet } from '~/server/db/schema';
import { createTranslator } from '~/server/i18n';

import { makePersistedSetting } from '~/lib/make-persisted-signal';

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

const petIconMap: Record<DatabasePet['type'], SvgIcons> = {
  dog: 'dog',
  cat: 'cat',
  bird: 'bird',
  rodent: 'rodent',
  rabbit: 'rabbit',
  horse: 'horse',
};

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
            fallback={<Icon use={petIconMap[props.pet.type]} size="md" />}
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

const AddBirthDateForm = clientOnly(() => import('~/lib/add-birthdate-form'));
const AddBreedForm = clientOnly(() => import('~/lib/add-pet-breed'));
const AddWeightForm = clientOnly(() => import('~/lib/add-weight-form'));

function QuickSetters(props: PetHomeCardProps) {
  const t = createTranslator('pet-forms');

  const [qs, toggle] = makePersistedSetting(`qs-toggles-${props.pet.id}`, {
    showBirthDate: !props.pet.dateOfBirth,
    showWeight: !props.pet.weight,
    showBreed: !props.pet.breed,
  });

  return (
    <div class="empty:hidden">
      <Switch>
        <Match when={qs()?.showBirthDate}>
          <SplitButton variant="outline" size="sm">
            <SplitButton.Inner
              popoverTarget={`${props.pet.id}-birth-date`}
              class="gap-2 text-nowrap"
            >
              <Icon use="calendar-plus" size="sm" />
              <Text with="label-sm">{t('animal-shortcut.birth-date')}</Text>
            </SplitButton.Inner>
            <SplitButton.Inner
              icon
              label={t('animal.drawer.cancel')}
              class="gap-2 text-nowrap"
              onClick={() =>
                toggle((old) => ({ ...old, showBirthDate: false }))
              }
            >
              <Icon use="x" size="xs" />
            </SplitButton.Inner>
          </SplitButton>
          <AddBirthDateForm
            id={`${props.pet.id}-birth-date`}
            pet={props.pet}
            onDismiss={() =>
              toggle((old) => ({ ...old, showBirthDate: false }))
            }
          />
        </Match>
        <Match when={qs()?.showWeight}>
          <SplitButton variant="outline" size="sm">
            <SplitButton.Inner
              class="gap-2 text-nowrap"
              popoverTarget={`${props.pet.id}-weight`}
            >
              <Icon use="scales" size="sm" />
              <Text with="label-sm">{t('animal-shortcut.weight')}</Text>
            </SplitButton.Inner>
            <SplitButton.Inner
              icon
              label={t('animal.drawer.cancel')}
              class="gap-2 text-nowrap"
              onClick={() => toggle((old) => ({ ...old, showWeight: false }))}
            >
              <Icon use="x" size="xs" />
            </SplitButton.Inner>
          </SplitButton>
          <AddWeightForm
            id={`${props.pet.id}-weight`}
            pet={props.pet}
            onDismiss={() => toggle((old) => ({ ...old, showWeight: false }))}
          />
        </Match>
        <Match when={qs()?.showBreed}>
          <SplitButton variant="outline" size="sm">
            <SplitButton.Inner
              class="gap-2 text-nowrap"
              popoverTarget={`${props.pet.id}-breed`}
            >
              <Icon use="paw-print" size="sm" />
              <Text with="label-sm">{t('animal-shortcut.breed')}</Text>
            </SplitButton.Inner>
            <SplitButton.Inner
              icon
              label={t('animal.drawer.cancel')}
              class="gap-2 text-nowrap"
              onClick={() => toggle((old) => ({ ...old, showBreed: false }))}
            >
              <Icon use="x" size="xs" />
            </SplitButton.Inner>
          </SplitButton>
          <AddBreedForm
            id={`${props.pet.id}-breed`}
            pet={props.pet}
            onDismiss={() => toggle((old) => ({ ...old, showBreed: false }))}
          />
        </Match>
      </Switch>
    </div>
  );
}
