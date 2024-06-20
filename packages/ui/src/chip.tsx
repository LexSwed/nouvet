import { splitProps, type ComponentProps } from 'solid-js';
import { cva, type VariantProps } from 'class-variance-authority';

import { Text } from './text';
import { tw } from './tw';

interface Props extends ComponentProps<'div'>, VariantProps<typeof chipCss> {}

export const Chip = (ownProps: Props) => {
  const [local, props] = splitProps(ownProps, ['tone']);
  return (
    <Text
      as="div"
      with="label-sm"
      {...props}
      class={tw(chipCss(local), props.class)}
    />
  );
};
const chipCss = cva(
  'bg-primary-container text-on-primary-container flex min-w-12 cursor-default flex-row items-center justify-center gap-2 self-end rounded-full p-2',
  {
    variants: {
      tone: {
        neutral: 'bg-on-surface/5 text-on-surface',
        primary: 'bg-primary-container/30 text-on-primary-container',
        secondary: 'bg-tertiary-container text-on-tertiary-container',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
);
