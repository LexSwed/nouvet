import { cva, type VariantProps } from 'class-variance-authority';
import { splitProps, type ValidComponent } from 'solid-js';
import { Dynamic, type DynamicProps } from 'solid-js/web';
import { tw } from './tw';

const textVariants = cva('font-sans m-0', {
  variants: {
    with: {
      'body': 'text-base',
      'body-xs': 'text-xs',
      'body-sm': 'text-sm',
      'body-lg': 'text-lg',
      'body-xl': 'text-xl',
      'label': 'text-sm font-medium',
      'label-lg': 'text-lg font-medium',
      'headline-1': 'text-3xl font-extrabold',
      'headline-2': 'text-2xl',
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
      true: 'leading-[1]',
    },
  },
});

const Text = <T extends ValidComponent>(
  ownProps: DynamicProps<T> & {
    /** @default 'span' */
    component?: T | undefined;
  } & VariantProps<typeof textVariants>,
) => {
  const [style, props] = splitProps(ownProps, [
    'with',
    'tone',
    'align',
    'dense',
  ]);

  return (
    <Dynamic
      {...(props as $noFix)}
      component={props.component || 'span'}
      class={tw(textVariants(style), props.class)}
    />
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type $noFix = any;

export { Text };
