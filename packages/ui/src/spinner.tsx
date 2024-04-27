import { splitProps, type JSX } from 'solid-js';
import { cva, type VariantProps } from 'class-variance-authority';

import { tw } from './tw';

interface Props
  extends JSX.SvgSVGAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerCss> {}

export const Spinner = (ownProps: Props) => {
  const [local, props] = splitProps(ownProps, ['size']);
  return (
    <svg
      {...props}
      class={tw(spinnerCss(local), props.class)}
      viewBox="0 0 50 50"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke-width="4"
        class="animate-spinner-circle stroke-current [stroke-linecap:round]"
      />
    </svg>
  );
};
const spinnerCss = cva('animate-spin', {
  variants: {
    size: {
      base: 'size-6',
      sm: 'size-5',
      lg: 'size-8',
      xl: 'size-12',
      cta: 'size-16',
    },
  },
  defaultVariants: {
    size: 'base',
  },
});
