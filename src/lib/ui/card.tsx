import { cva, type VariantProps } from 'class-variance-authority';
import { mergeProps, type JSX } from 'solid-js';
import { tw } from './tw';

const cardVariants = cva('rounded-lg p-3', {
  variants: {
    variant: {
      elevated: 'bg-surface text-on-surface shadow-1',
      flat: 'bg-surface text-on-surface',
      filled:
        'bg-secondary-container text-on-secondary-container intent:bg-secondary-container/80',
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

interface NavCardProps
  extends JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
    CardVariants {
  /**
   * @default 'filled'
   */
  variant?: CardVariants['variant'];
}
export const NavCard = (ownProps: NavCardProps) => {
  const props = mergeProps<[typeof ownProps, typeof ownProps]>(
    { variant: 'filled' },
    ownProps,
  );

  return (
    <a
      {...props}
      class={tw(cardVariants({ variant: props.variant }), props.class)}
    />
  );
};

export { Card };
