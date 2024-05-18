import { A } from '@solidjs/router';
import { createUniqueId, Match, Show, Suspense, Switch } from 'solid-js';
import {
  Avatar,
  Button,
  Card,
  Icon,
  MenuItem,
  MenuList,
  Popover,
  SplitButton,
  Text,
  type SvgIcons,
} from '@nou/ui';

import type { DatabasePet, DatabaseUser } from '~/server/db/schema';
import { createTranslator } from '~/server/i18n';

import { createPersistedSetting } from '~/lib/utils/make-persisted-signal';

import AddBirthDateForm from './add-birthdate-form';
import AddBreedForm from './add-pet-breed';
import AddWeightForm from './add-weight-form';

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
  owner:
    | {
        id: DatabaseUser['id'];
        name: string | null | undefined;
        avatarUrl: string | null | undefined;
      }
    | undefined
    | null;
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
  const petPopoverId = `popover-${createUniqueId()}`;
  let triggerRef: HTMLElement | null = null;
  const t = createTranslator('app');

  const hasMissingInfo = () =>
    !props.pet.dateOfBirth || !props.pet.weight || !props.pet.breed;

  return (
    <Card
      class="flex min-w-52 flex-col gap-4"
      ref={(el: HTMLElement) => (triggerRef = el)}
    >
      <Button
        variant="ghost"
        class="-m-4 flex h-auto cursor-pointer flex-row items-center justify-start gap-4 rounded-2xl p-3"
        popoverTarget={petPopoverId}
        id={`pet-${props.pet.id}`}
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
        <Text with="body-lg">{props.pet.name}</Text>
        <Show when={props.owner}>
          {(owner) => (
            <div class="bg-surface -m-1 ms-auto self-start rounded-full p-1">
              <Avatar
                avatarUrl={owner().avatarUrl || ''}
                name={owner().name || ''}
                size="xs"
              />
            </div>
          )}
        </Show>
      </Button>
      <Popover
        id={petPopoverId}
        placement="top-to-top left-to-left"
        class="-m-1 flex transform-none flex-col gap-4 p-2"
        onToggle={(e: ToggleEvent) => {
          if (triggerRef && e.newState === 'open') {
            triggerRef.scrollIntoView({
              inline: 'start',
              behavior: 'smooth',
            });
          }
        }}
      >
        {(open) => (
          <Suspense>
            <Show when={open()}>
              <A
                href={`/app/pet/${props.pet.id}/`}
                class="group/link outline-on-surface -m-2 flex flex-row items-center gap-4 rounded-[inherit] p-4 -outline-offset-4 focus:outline-4"
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
                    fallback={
                      <Icon use={petIconMap[props.pet.type]} size="md" />
                    }
                  />
                </div>
                <Text with="body-lg">{props.pet.name}</Text>
                <Button
                  icon
                  label={t('go-to-pet-page', { petName: props.pet.name })}
                  variant="ghost"
                  class="ms-auto"
                  tabIndex={-1}
                >
                  <Icon use="pencil" size="sm" />
                </Button>
              </A>
              <MenuList class="min-w-52">
                <Show when={props.owner}>
                  {(owner) => (
                    <MenuItem as={A} href={`/app/family/${owner().id}/`}>
                      <Avatar
                        avatarUrl={owner().avatarUrl || ''}
                        name={owner().name || ''}
                        size="xs"
                      />
                      <Text>{owner().name || t('pet-owner-no-name')}</Text>
                    </MenuItem>
                  )}
                </Show>
                <MenuItem as={A} href={`/app/pet/${props.pet.id}/`}>
                  <Icon use="pencil" size="sm" />
                  {t('pet-menu.edit-info')}
                </MenuItem>
                <MenuItem
                  as="button"
                  type="button"
                  popoverTarget={`${props.pet.id}-menu-weight`}
                >
                  <Icon use="scales" size="sm" />
                  {t('pet-menu.add-weight')}
                </MenuItem>
                <MenuItem>
                  <Icon use="note" size="sm" />
                  {t('pet-menu.add-note')}
                </MenuItem>
                <MenuItem>
                  <Icon use="aid" size="sm" />
                  {t('pet-menu.book')}
                </MenuItem>
              </MenuList>
              <AddWeightForm
                id={`${props.pet.id}-menu-weight`}
                pet={props.pet}
                anchor={petPopoverId}
              />
            </Show>
          </Suspense>
        )}
      </Popover>
      <div class="flex flex-row items-center gap-2 empty:hidden">
        <Show when={hasMissingInfo()}>
          <Suspense fallback={null}>
            <QuickSetters pet={props.pet} />
          </Suspense>
        </Show>
      </div>
    </Card>
  );
};

function QuickSetters(props: { pet: PetHomeCardProps['pet'] }) {
  const t = createTranslator('pet-forms');

  const [qs, toggle] = createPersistedSetting(`qs-toggles-${props.pet.id}`, {
    showBirthDate: !props.pet.dateOfBirth,
    showWeight: !props.pet.weight,
    showBreed: !props.pet.breed,
  });

  return (
    <Switch>
      <Match when={qs()?.showBirthDate}>
        <SplitButton
          variant="outline"
          class="outline-surface bg-surface outline outline-8"
          size="sm"
        >
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
            onClick={() => toggle((old) => ({ ...old, showBirthDate: false }))}
          >
            <Icon use="x" size="xs" />
          </SplitButton.Inner>
        </SplitButton>
        <AddBirthDateForm
          id={`${props.pet.id}-birth-date`}
          pet={props.pet}
          onDismiss={() => toggle((old) => ({ ...old, showBirthDate: false }))}
        />
      </Match>
      <Match when={qs()?.showWeight}>
        <SplitButton
          variant="outline"
          class="outline-surface bg-surface outline outline-8"
          size="sm"
        >
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
        <SplitButton
          variant="outline"
          class="outline-surface bg-surface outline outline-8"
          size="sm"
        >
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
  );
}
