import { cva, type VariantProps } from 'class-variance-authority';
import { type JSX } from 'solid-js';
import { tw } from './tw';

const iconVariants = cva('shrink-0 inline', {
  variants: {
    size: {
      font: 'w-font h-font',
      xs: 'size-6',
      sm: 'size-8',
      md: 'size-12',
      lg: 'size-18',
      xl: 'size-24',
    },
  },
  defaultVariants: {
    size: 'font',
  },
});

const Icon = (
  props: JSX.SvgSVGAttributes<SVGSVGElement> &
    VariantProps<typeof iconVariants> & {
      icon: string;
    },
) => {
  return (
    <svg {...props} class={tw(iconVariants({ size: props.size }), props.class)}>
      <use href={`#${props.icon}`} />
    </svg>
  );
};

export { Icon };
