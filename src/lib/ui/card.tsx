import { A, type AnchorProps } from '@solidjs/router';
import { cva, type VariantProps } from 'class-variance-authority';
import { type JSX } from 'solid-js';
import { mergeDefaultProps } from '../merge-default-props';
import { tw } from './tw';

const cardVariants = cva('rounded-lg p-6', {
  variants: {
    variant: {
      elevated: 'bg-surface text-on-surface shadow-1',
      flat: 'bg-surface-container text-on-surface',
      filled:
        'bg-secondary-container text-on-secondary-container transition-all intent:ring-8 intent:ring-secondary-container',
      outlined: 'bg-surface text-on-surface border border-outline-variant',
    },
  },
  defaultVariants: {
    variant: 'elevated',
  },
});

type CardVariants = VariantProps<typeof cardVariants>;

interface CardProps extends JSX.HTMLAttributes<HTMLDivElement>, CardVariants {}

const Card = (props: CardProps) => (
  <div
    {...props}
    class={tw(cardVariants({ variant: props.variant }), props.class)}
  />
);

interface NavCardProps extends AnchorProps, CardVariants {
  /**
   * @default 'filled'
   */
  variant?: CardVariants['variant'];
}
export const NavCard = (ownProps: NavCardProps) => {
  const props = mergeDefaultProps({ variant: 'filled' }, ownProps);

  return (
    <A
      {...props}
      class={tw(cardVariants({ variant: props.variant }), props.class)}
    />
  );
};

export { Card };
