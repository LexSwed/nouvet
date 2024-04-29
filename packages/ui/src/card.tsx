import { A, type AnchorProps } from '@solidjs/router';
import { splitProps, type JSX } from 'solid-js';
import { cva, type VariantProps } from 'class-variance-authority';

import { tw } from './tw';
import { mergeDefaultProps } from './utils';

const cardVariants = cva(
  'flex flex-col gap-2 rounded-2xl p-4 transition-shadow duration-200',
  {
    variants: {
      _link: {
        true: 'intent:outline-2 outline-offset-4',
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
        class:
          'bg-primary-container text-on-primary-container outline-primary intent:bg-primary-container/90',
      },
      {
        variant: 'tonal',
        tone: 'primary-light',
        class:
          'bg-primary-container/30 text-on-primary-container outline-primary-container [&a]:intent:bg-primary-container/20',
      },
      {
        variant: 'tonal',
        tone: 'secondary',
        class: 'bg-tertiary-container text-on-tertiary-container',
      },
      {
        variant: 'tonal',
        tone: 'neutral',
        class: 'bg-on-surface/5 text-on-surface outline-on-surface',
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
  },
);

type CardVariants = Omit<VariantProps<typeof cardVariants>, '_link'>;

interface CardProps extends JSX.HTMLAttributes<HTMLDivElement>, CardVariants {}

const Card = (ownProps: CardProps) => {
  const [local, props] = splitProps(ownProps, ['variant', 'tone']);
  return <div {...props} class={tw(cardVariants(local), props.class)} />;
};

interface NavCardProps extends AnchorProps, CardVariants {
  /**
   * @default 'filled'
   */
  variant?: CardVariants['variant'];
}
export const NavCard = (ownProps: NavCardProps) => {
  const [local, props] = splitProps(
    mergeDefaultProps(ownProps, { variant: 'tonal', tone: 'primary' }),
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
