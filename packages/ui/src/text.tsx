import { splitProps, type ValidComponent } from 'solid-js';
import { Dynamic, type DynamicProps } from 'solid-js/web';
import { cva, type VariantProps } from 'class-variance-authority';

import { tw } from './tw';

const textVariants = cva('m-0 whitespace-pre-line font-sans', {
  variants: {
    with: {
      'body': 'text-base font-normal',
      'body-xs': 'text-xs font-normal',
      'body-sm': 'text-sm font-normal',
      'body-lg': 'text-lg font-normal',
      'body-xl': 'text-xl font-normal',
      'label': 'text-sm font-medium',
      'label-sm': 'text-xs',
      'label-lg': 'text-lg font-medium',
      'headline-1': 'text-3xl font-semibold',
      'headline-2': 'text-2xl font-semibold',
      'headline-3': 'text-xl',
      'headline-4': 'text-xl',
      'headline-5': 'text-xl',
      'headline-6': 'text-lg uppercase',
      'overline': 'text-xs uppercase tracking-wide',
      'mono': 'font-mono text-sm',
      'mono-sm': 'font-mono text-xs',
      'mono-lg': 'font-mono text-base',
    },
    tone: {
      neutral: 'text-on-background',
      accent: 'text-primary',
      light: 'text-on-surface-variant',
      success: 'text-tertiary',
      danger: 'text-error',
    },
    align: {
      start: 'text-start',
      center: 'text-center',
      end: 'text-end',
      justify: 'text-justify',
    },
    dense: {
      true: 'leading-none',
    },
  },
});

type TextProps<T extends ValidComponent> = Omit<DynamicProps<T>, 'component'> &
  VariantProps<typeof textVariants> & {
    /** @default 'span' */
    as?: T | undefined;
  };

const Text = <T extends ValidComponent>(ownProps: TextProps<T>) => {
  const [style, component, props] = splitProps(
    ownProps as TextProps<'span'>,
    ['with', 'tone', 'align', 'dense'],
    ['as', 'class'],
  );

  return (
    <Dynamic
      {...props}
      component={component.as || 'span'}
      class={tw(textVariants(style), component.class)}
    />
  );
};

export { Text };
