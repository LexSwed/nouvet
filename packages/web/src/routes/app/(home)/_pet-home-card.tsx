import { A } from '@solidjs/router';
import { clientOnly } from '@solidjs/start';
import { createUniqueId, Match, Show, Suspense, Switch } from 'solid-js';
import {
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

import type { DatabasePet } from '~/server/db/schema';
import { createTranslator } from '~/server/i18n';

import { createPersistedSetting } from '~/lib/make-persisted-signal';

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
  const petPopoverId = `popover-${createUniqueId()}`;
  let triggerRef: HTMLElement | null = null;
  const t = createTranslator('app');

  const hasMissingInfo = () =>
    !props.pet.dateOfBirth || !props.pet.weight || !props.pet.breed;

  return (
    <Card
      variant="flat"
      class="flex min-w-52 flex-col gap-4"
      ref={(el) => (triggerRef = el)}
    >
      <Button
        variant="ghost"
        class="-m-4 h-auto cursor-pointer justify-start rounded-2xl p-3"
        popoverTarget={petPopoverId}
      >
        <div class="flex flex-row items-center gap-4">
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
        </div>
      </Button>
      <Popover
        id={petPopoverId}
        offset={(state) => ({
          mainAxis: -1 * state.rects.reference.height - 4,
          crossAxis: -4,
        })}
        strategy="fixed"
        placement="bottom-start"
        class="flex transform-none flex-col gap-4 p-4"
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
                class="group/link -m-4 flex flex-row items-center gap-4 p-4"
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
                  class="group-hover/link:bg-on-background/5 ms-auto"
                  tabIndex={-1}
                >
                  <Icon use="pencil" size="sm" />
                </Button>
              </A>
              <MenuList class="min-w-52">
                <MenuItem>
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
                // NB: otherwise nested inside top-level popover won't calculate available space correctly
                strategy="fixed"
              />
            </Show>
          </Suspense>
        )}
      </Popover>
      <Show when={hasMissingInfo()}>
        <Suspense fallback={null}>
          <QuickSetters pet={props.pet} />
        </Suspense>
      </Show>
    </Card>
  );
};

const AddBirthDateForm = clientOnly(() => import('~/lib/add-birthdate-form'));
const AddBreedForm = clientOnly(() => import('~/lib/add-pet-breed'));
const AddWeightForm = clientOnly(() => import('~/lib/add-weight-form'));

function QuickSetters(props: PetHomeCardProps) {
  const t = createTranslator('pet-forms');

  const [qs, toggle] = createPersistedSetting(`qs-toggles-${props.pet.id}`, {
    showBirthDate: !props.pet.dateOfBirth,
    showWeight: !props.pet.weight,
    showBreed: !props.pet.breed,
  });

  return (
    <div class="empty:hidden">
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
    </div>
  );
}
