import { cva, type VariantProps } from 'class-variance-authority';
import { type JSX } from 'solid-js';
import { tw } from './tw';

const iconVariants = cva('', {
  variants: {
    size: {
      font: 'w-font h-font',
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-7 h-7',
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
    <svg
      {...props}
      class={tw(iconVariants({ size: props.size }), 'inline', props.class)}
    >
      <use href={`#${props.icon}`} />
    </svg>
  );
};

export { Icon };
