import { cva, type VariantProps } from 'class-variance-authority';
import { splitProps, type JSX } from 'solid-js';
import spriteHref from '../../web/public/assets/sprite.svg';
import { type SvgIcons } from '../../web/src/assets/icons/svg-icons';
import { tw } from './tw';
export type { SvgIcons } from '../../web/src/assets/icons/svg-icons';

const iconVariants = cva('shrink-0 inline', {
  variants: {
    size: {
      font: 'w-font h-font',
      xs: 'size-4',
      sm: 'size-6',
      md: 'size-8',
      lg: 'size-16',
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
    <svg
      {...props}
      class={tw(iconVariants(local), props.class)}
      aria-hidden="true"
    >
      <use href={`${spriteHref}#${local.use}`} />
    </svg>
  );
};

export { Icon };
