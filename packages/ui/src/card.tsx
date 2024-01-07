import { A, type AnchorProps } from '@solidjs/router';
import { splitProps, type JSX } from 'solid-js';
import { cva, type VariantProps } from 'class-variance-authority';

import { tw } from './tw';
import { mergeDefaultProps } from './utils';

const cardVariants = cva('rounded-lg p-6 transition-shadow', {
  variants: {
    _link: {
      true: '',
      false: '',
    },
    variant: {
      flat: 'bg-primary/8 text-on-surface',
      filled:
        'bg-primary-container focus:outline-background text-on-primary-container',
      outlined: 'bg-surface text-on-surface border-outline/20 border',
    },
  },
  defaultVariants: {
    variant: 'flat',
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
