import { cva, type VariantProps } from 'class-variance-authority';
import { type JSX } from 'solid-js';
import { tw } from './tw';

const cardVariants = cva(
  'rounded-lg bg-surface text-on-surface p-3 text-card-foreground shadow-sm',
  {
    variants: {
      variant: {
        elevated:
          'bg-surface-container-low text-on-surface hover:shadow-2 shadow-1',
        filled: 'bg-surface-container-highest text-on-surface',
        outlined: 'bg-surface text-on-surface border border-outline-variant',
      },
    },
    defaultVariants: {
      variant: 'elevated',
    },
  },
);

const Card = (
  props: JSX.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>,
) => (
  <div
    {...props}
    class={tw(cardVariants({ variant: props.variant }), props.class)}
  />
);

export { Card };
