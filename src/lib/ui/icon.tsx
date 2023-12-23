import { cva, type VariantProps } from 'class-variance-authority';
import { splitProps, type JSX } from 'solid-js';
import { tw } from './tw';
import type { SvgIcons } from '~/assets/icons/svg-icons';

const iconVariants = cva('shrink-0 inline', {
  variants: {
    size: {
      font: 'w-font h-font',
      xs: 'size-6',
      sm: 'size-8',
      md: 'size-12',
      lg: 'size-20',
      xl: 'size-24',
    },
  },
  defaultVariants: {
    size: 'font',
  },
});

export interface IconProps
  extends JSX.SvgSVGAttributes<SVGSVGElement>,
    VariantProps<typeof iconVariants> {
  use: SvgIcons;
}

const Icon = (ownProps: IconProps) => {
  const [local, props] = splitProps(ownProps, ['use', 'size']);
  return (
    <svg {...props} class={tw(iconVariants(local), props.class)}>
      <use href={`/assets/sprite.svg#${local.use}`} />
    </svg>
  );
};

export { Icon };
