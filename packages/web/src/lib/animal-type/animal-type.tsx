import {
  createSignal,
  createUniqueId,
  For,
  Show,
  Suspense,
  type ComponentProps,
} from 'solid-js';
import { Icon, RadioCard, Text, tw, type SvgIcons } from '@nou/ui';

import { createTranslator } from '~/i18n';

import * as cssStyles from './animal-type.module.css';

interface AnimalTypeSelectProps {
  /** input radio element name attribute for animal type */
  typeName: string;
  /** input radio element `name` attribute for animal gender */
  genderName: string;
}

const AnimalTypeSelect = (props: AnimalTypeSelectProps) => {
  const t = createTranslator('app');
  const animalTypes: Array<{ value: string; label: string; icon: SvgIcons }> = [
    {
      value: 'dog',
      label: t('app.animal-type.dog')!,
      icon: 'dog',
    },
    {
      value: 'cat',
      label: t('app.animal-type.cat')!,
      icon: 'cat',
    },
    {
      value: 'bird',
      label: t('app.animal-type.bird')!,
      icon: 'bird',
    },
    {
      value: 'fish',
      label: t('app.animal-type.fish')!,
      icon: 'fish',
    },
    {
      value: 'rabbit',
      label: t('app.animal-type.rabbit')!,
      icon: 'rabbit',
    },
    {
      value: 'horse',
      label: t('app.animal-type.horse')!,
      icon: 'horse',
    },
    {
      value: 'other',
      label: t('app.animal-type.other')!,
      icon: 'alien',
    },
  ];
  const [checked, setChecked] = createSignal(0);
  return (
    <div class={cssStyles.wrapper}>
      <For each={animalTypes}>
        {(item, index) => {
          return (
            <RadioCard
              class={tw('snap-x', cssStyles.card)}
              name={props.typeName}
              value={item.value}
              label={item.label}
              icon={<Icon size="sm" use={item.icon} />}
              checked={index() === checked()}
              onChange={() => setChecked(index())}
            >
              <Show when={index() === checked()} fallback={null}>
                <Suspense>
                  <GenderSwitch name={props.genderName} />
                </Suspense>
              </Show>
            </RadioCard>
          );
        }}
      </For>
    </div>
  );
};

const GenderSwitch = (props: { name: AnimalTypeSelectProps['genderName'] }) => {
  const t = createTranslator('app');
  const id = createUniqueId();
  return (
    <fieldset class={cssStyles.genderSwitch} aria-labelledby="">
      <Text with="label" as="label" id={id}>
        {t('app.animal-gender')}
      </Text>
      <div class="flex flex-row items-center gap-4">
        <label class={cssStyles.genderSwitchLabel}>
          <input
            type="radio"
            name={props.name}
            class={cssStyles.genderSwitchInput}
            value="male"
          />
          <Text with="label">{t('app.animal-gender.male')}</Text>
        </label>
        <div class="inline-grid">
          <SvgGender class="size-10" aria-hidden />
        </div>
        <label class={cssStyles.genderSwitchLabel}>
          <input
            type="radio"
            name={props.name}
            class={cssStyles.genderSwitchInput}
            value="female"
          />
          <Text with="label">{t('app.animal-gender.female')}</Text>
        </label>
      </div>
    </fieldset>
  );
};

const SvgGender = (props: ComponentProps<'svg'>) => {
  return (
    <svg viewBox="0 0 236 272" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs />
      <circle cx="116" cy="120" r="72" opacity="0.2" />
      <circle
        cx="116"
        cy="120"
        r="72"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="16"
      />
      <line
        x1="166.91"
        y1="69.09"
        x2="228"
        y2="8"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="16"
      />
      <polyline
        points="180 8 228 8 228 56"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="16"
      />
      <line
        x1="116"
        y1="192"
        x2="116"
        y2="264"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="16"
      />
      <line
        x1="76"
        y1="232"
        x2="156"
        y2="232"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="16"
      />
    </svg>
  );
};

export { AnimalTypeSelect };
