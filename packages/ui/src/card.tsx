import { A, type AnchorProps } from '@solidjs/router';
import { splitProps, type JSX } from 'solid-js';
import { cva, type VariantProps } from 'class-variance-authority';

import { tw } from './tw';
import { mergeDefaultProps } from './utils';

const cardVariants = cva('rounded-lg p-6 transition-shadow duration-200', {
  variants: {
    _link: {
      true: '',
      false: '',
    },
    variant: {
      elevated: 'bg-surface text-on-surface shadow-sm',
      flat: 'bg-surface text-on-surface',
      filled: 'bg-secondary-container text-on-secondary-container',
      outlined: 'bg-surface text-on-surface border-outline/20 border',
    },
  },
  compoundVariants: [
    {
      _link: true,
      variant: 'flat',
      class: 'intent:bg-surface-container-high',
    },
    {
      _link: true,
      variant: 'filled',
      class:
        'outline-primary intent:bg-secondary-container/90 intent:text-on-secondary-container intent:outline-2 outline-offset-4',
    },
  ],
  defaultVariants: {
    variant: 'elevated',
  },
});

type CardVariants = Omit<VariantProps<typeof cardVariants>, '_link'>;

interface CardProps extends JSX.HTMLAttributes<HTMLDivElement>, CardVariants {}

const Card = (ownProps: CardProps) => {
  const [local, props] = splitProps(ownProps, ['variant', 'class']);
  return (
    <div
      {...props}
      class={tw(cardVariants({ variant: local.variant }), local.class)}
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
    mergeDefaultProps(ownProps, { variant: 'filled' }),
    ['variant', 'class'],
  );

  return (
    <A
      {...props}
      class={tw(
        cardVariants({ variant: local.variant, _link: true }),
        local.class,
      )}
    />
  );
};

export { Card };
