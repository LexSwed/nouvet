import { A, type AnchorProps } from '@solidjs/router';
import { splitProps, type ValidComponent } from 'solid-js';
import { Dynamic, type DynamicProps } from 'solid-js/web';
import { cva, type VariantProps } from 'class-variance-authority';

import { tw } from './tw';
import { mergeDefaultProps } from './utils';

const cardVariants = cva('flex flex-col gap-2 rounded-2xl p-4', {
  variants: {
    _link: {
      true: 'intent:outline-2 outline-offset-4 transition duration-200',
      false: '',
    },
    variant: {
      elevated: 'bg-surface text-on-surface shadow-sm',
      flat: 'bg-surface shadow-flat text-on-surface',
      tonal: '',
      outlined: 'border-outline/20 bg-surface text-on-surface border',
    },
    tone: {
      'neutral': '',
      'primary': '',
      'primary-light': '',
      'secondary': '',
      'failure': '',
    },
  },
  compoundVariants: [
    {
      variant: 'tonal',
      tone: 'primary',
      class: 'bg-primary-container text-on-primary-container',
    },
    {
      _link: true,
      variant: 'tonal',
      tone: 'primary',
      class: 'outline-primary intent:filter-darker',
    },
    {
      variant: 'tonal',
      tone: 'primary-light',
      class: 'bg-primary-container/30 text-on-primary-container',
    },
    {
      variant: 'tonal',
      tone: 'primary-light',
      _link: true,
      class: 'outline-primary-container intent:bg-primary-container/20',
    },
    {
      variant: 'tonal',
      tone: 'secondary',
      class: 'bg-tertiary-container text-on-tertiary-container',
    },
    {
      variant: 'tonal',
      tone: 'primary-light',
      _link: true,
      class: 'outline-primary intent:bg-primary-container/90',
    },
    {
      variant: 'tonal',
      tone: 'neutral',
      class: 'bg-on-surface/5 text-on-surface',
    },
    {
      variant: 'tonal',
      tone: 'neutral',
      _link: true,
      class: 'outline-on-surface intent:bg-on-surface/8',
    },
    {
      variant: 'tonal',
      tone: 'failure',
      class: 'bg-error-container text-on-error-container',
    },
  ],
  defaultVariants: {
    tone: 'neutral',
    variant: 'elevated',
  },
});

type CardVariants = Omit<VariantProps<typeof cardVariants>, '_link'>;

type CardProps<T extends ValidComponent> = Omit<DynamicProps<T>, 'component'> &
  CardVariants & {
    /** @default 'span' */
    as?: T | undefined;
  };

const Card = <T extends ValidComponent>(ownProps: CardProps<T>) => {
  const [local, props] = splitProps(ownProps, ['variant', 'tone', 'as']);
  return (
    <Dynamic
      component={local.as || 'div'}
      {...props}
      class={tw(cardVariants(local), props.class)}
    />
  );
};

interface NavCardProps extends AnchorProps, CardVariants {
  /**
   * @default 'filled'
   */
  variant?: CardVariants['variant'];
}
export const NavCard = (ownProps: NavCardProps) => {
  const [local, props] = splitProps(
    mergeDefaultProps(ownProps, { variant: 'tonal', tone: 'primary-light' }),
    ['variant', 'tone'],
  );

  return (
    <A
      {...props}
      class={tw(
        cardVariants({ tone: local.tone, variant: local.variant, _link: true }),
        props.class,
      )}
    />
  );
};

export { Card };
