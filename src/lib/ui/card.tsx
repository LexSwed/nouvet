import { A, type AnchorProps } from '@solidjs/router';
import { cva, type VariantProps } from 'class-variance-authority';
import { type JSX } from 'solid-js';
import { mergeDefaultProps } from '../merge-default-props';
import { tw } from './tw';

const cardVariants = cva('rounded-lg p-6 transition-shadow', {
  variants: {
    _link: {
      true: '',
      false: '',
    },
    variant: {
      'elevated': 'bg-surface text-on-surface shadow-1',
      'flat': 'bg-surface-container text-on-surface',
      'filled':
        'bg-secondary-container focus:outline-background text-on-secondary-container',
      'filled-secondary':
        'bg-tertiary-container focus:outline-background text-on-tertiary-container',
      'outlined': 'bg-surface text-on-surface border border-outline-variant',
    },
  },
  defaultVariants: {
    variant: 'elevated',
  },
  compoundVariants: [
    {
      variant: 'filled',
      _link: true,
      class: 'intent:ring-8 intent:ring-secondary-container',
    },
    {
      variant: 'filled-secondary',
      _link: true,
      class: 'intent:ring-8 intent:ring-tertiary-container',
    },
  ],
});

type CardVariants = Omit<VariantProps<typeof cardVariants>, '_link'>;

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
      class={tw(
        cardVariants({ variant: props.variant, _link: true }),
        props.class,
      )}
    />
  );
};

export { Card };
