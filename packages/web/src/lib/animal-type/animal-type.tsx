import { createUniqueId, For, type ComponentProps } from 'solid-js';
import { Icon, RadioCard, Text, tw, type SvgIcons } from '@nou/ui';

import { createTranslator } from '~/server/i18n';

import * as cssStyles from './animal-type.module.css';

interface AnimalTypeSelectProps {
  /** input radio element name attribute for animal type */
  name: string;
}

const AnimalTypeSelect = (props: AnimalTypeSelectProps) => {
  const t = createTranslator('pet-forms');
  const animalTypes = (): Array<{
    value: string;
    label: string;
    icon: SvgIcons;
  }> => [
    {
      value: 'dog',
      label: t('animal-type.dog')!,
      icon: 'dog',
    },
    {
      value: 'cat',
      label: t('animal-type.cat')!,
      icon: 'cat',
    },
    {
      value: 'bird',
      label: t('animal-type.bird')!,
      icon: 'bird',
    },
    {
      value: 'rabbit',
      label: t('animal-type.rabbit')!,
      icon: 'rabbit',
    },
    {
      value: 'rodent',
      label: t('animal-type.rodent')!,
      icon: 'rodent',
    },
    {
      value: 'horse',
      label: t('animal-type.horse')!,
      icon: 'horse',
    },
  ];

  return (
    <div
      class={
        'scrollbar-none -m-4 flex w-[fit-content] max-w-[stretch] snap-x snap-mandatory scroll-px-4 gap-2 overflow-auto p-4'
      }
    >
      <For each={animalTypes()}>
        {(item) => {
          return (
            <RadioCard
              class="basis-[8rem] snap-start last-of-type:snap-end has-[input:checked]:basis-[9rem]"
              name={props.name}
              value={item.value}
              label={item.label}
              icon={<Icon size="sm" use={item.icon} />}
            />
          );
        }}
      </For>
    </div>
  );
};

const GenderSwitch = (props: { name: string }) => {
  const t = createTranslator('pet-forms');
  const id = createUniqueId();
  return (
    <fieldset
      class={tw(cssStyles.genderSwitch, 'flex flex-col gap-2')}
      aria-labelledby={id}
    >
      <Text with="label-sm" as="label" id={id} class="ms-2">
        {t('animal-gender')}
      </Text>
      <div
        class={tw(
          cssStyles.genderWrapper,
          'grid grid-cols-[1fr,auto,1fr] items-center gap-2',
        )}
      >
        <GenderRadio
          name={props.name}
          value="male"
          label={t('animal-gender.male')!}
        />
        <SvgGender
          class={tw(cssStyles.genderIcon, 'relative mt-1 size-10')}
          aria-hidden
        />
        <GenderRadio
          name={props.name}
          value="female"
          label={t('animal-gender.female')!}
        />
      </div>
    </fieldset>
  );
};

const GenderRadio = (props: { name: string; value: string; label: string }) => {
  return (
    <label
      class={tw(
        cssStyles.genderSwitchLabel,
        'relative text-on-surface border-2 border-on-surface/5 rounded-md py-1 grid place-items-center h-12 px-2 text-center transition-colors duration-200',
      )}
    >
      <input
        type="radio"
        name={props.name}
        class="sr-only"
        value={props.value}
      />
      <Text
        with="label"
        class="inline-block text-ellipsis text-nowrap"
        title={props.label}
      >
        {props.label}
      </Text>
    </label>
  );
};

const SvgGender = (props: ComponentProps<'svg'>) => {
  return (
    <svg viewBox="0 0 236 272" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs />
      <circle cx="116" cy="120" r="72" fill="currentColor" opacity="0.2" />
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
      <g data-male>
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
      </g>
      <g data-female>
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
      </g>
    </svg>
  );
};

export { AnimalTypeSelect, GenderSwitch };
