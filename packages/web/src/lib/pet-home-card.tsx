import { A } from '@solidjs/router';
import { clientOnly } from '@solidjs/start';
import { Show } from 'solid-js';
import { Button, Card, Drawer, Icon, Text } from '@nou/ui';

import { createTranslator } from '~/server/i18n';

interface PetHomeCard {
  pet: {
    id: number;
    pictureUrl: string | null;
    name: string;
  };
}

const AddBirthDateForm = clientOnly(() => import('./add-birthdate-form'));

export const PetHomeCard = (props: PetHomeCard) => {
  const t = createTranslator('app');
  return (
    <Card role="listitem" variant="flat" class="flex w-full flex-col gap-4">
      <A
        href={`/app/pet/${props.pet.id}/`}
        class="-m-4 flex flex-row items-start gap-4 p-4"
      >
        <div class="bg-tertiary/10 text-tertiary grid size-24 shrink-0 place-content-center rounded-md">
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
          <Text with="body-xl">{props.pet.name}</Text>
          <Button icon variant="ghost" size="sm" aria-hidden tabIndex={-1}>
            <Icon use="pencil" size="sm" />
          </Button>
        </div>
      </A>
      <div class="flex flex-col">
        <ul class="overflow-snap -mx-4 grid scroll-p-4 grid-flow-col justify-start gap-2 px-4 py-2 [grid-auto-columns:min-content]">
          <li class="contents">
            <Button
              variant="outline"
              size="sm"
              class="gap-2 text-nowrap"
              popoverTarget={`${props.pet.id}-birth-date`}
            >
              <Icon use="calendar-plus" size="sm" />
              <Text with="label-sm">{t('app.animal-shortcut.birth-date')}</Text>
            </Button>
            <Drawer id={`${props.pet.id}-birth-date`}>
              <AddBirthDateForm />
            </Drawer>
          </li>
          <li class="contents">
            <Button
              variant="outline"
              size="sm"
              class="gap-2 text-nowrap"
              popoverTarget={`${props.pet.id}-weight`}
            >
              <Icon use="scales" size="sm" />
              <Text with="label-sm">{t('app.animal-shortcut.weight')}</Text>
            </Button>
          </li>
          <li class="contents">
            <Button
              variant="outline"
              size="sm"
              class="gap-2 text-nowrap"
              popoverTarget={`${props.pet.id}-nutrition`}
            >
              <Icon use="carrot" size="sm" />
              <Text with="label-sm">{t('app.animal-shortcut.nutrition')}</Text>
            </Button>
          </li>
        </ul>
      </div>
    </Card>
  );
};
