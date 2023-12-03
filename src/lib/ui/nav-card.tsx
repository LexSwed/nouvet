import { A, type AnchorProps } from '@solidjs/router';
import { cva, type VariantProps } from 'class-variance-authority';
import { tw } from './tw';

const navCardVariants = cva(
  'rounded-xl px-4 py-3 transition-colors outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary:
          'bg-secondary-container text-on-secondary-container focus-visible:ring-primary intent:bg-secondary-container/80',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
);

const NavCard = (props: AnchorProps & VariantProps<typeof navCardVariants>) => (
  <A
    {...props}
    class={tw(navCardVariants({ variant: props.variant }), props.class)}
  />
);

export { NavCard };
