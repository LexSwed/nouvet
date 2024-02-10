import { A } from '@solidjs/router';
import { Show, splitProps, type ValidComponent } from 'solid-js';
import { Dynamic, type DynamicProps } from 'solid-js/web';
import { cva, type VariantProps } from 'class-variance-authority';

import { Spinner } from './spinner';
import { tw } from './tw';
import { mergeDefaultProps } from './utils';

export const buttonVariants = cva(
  'relative inline-flex cursor-default items-center justify-center rounded-lg text-sm font-medium transition-[filter,colors] focus-visible:outline-4 focus-visible:outline-offset-4 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-on-primary outline-primary',
        destructive: 'bg-destructive text-on-destructive outline-destructive',
        outline:
          'border-outline text-on-surface outline-on-surface rounded-full border bg-transparent',
        secondary:
          'bg-tertiary-container text-on-tertiary-container outline-tertiary rounded-full',
        ghost: 'text-on-surface outline-on-surface',
        link: 'text-primary underline-offset-4',
      },
      size: {
        base: 'h-12 min-w-12 px-6 py-2 text-base',
        sm: 'h-10 min-w-10 px-3 text-sm',
        lg: 'h-14 min-w-14 px-8 text-lg',
        cta: 'h-16 min-w-16 rounded-full px-8 text-lg',
      },
      loading: {
        true: '',
        false: '',
      },
      icon: {
        true: 'rounded-full p-0',
      },
      split: {
        true: 'flex p-0 [&>*]:rounded-[inherit]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'base',
      icon: false,
      split: false,
    },
    compoundVariants: [
      {
        split: false,
        variant: 'default',
        class: 'intent:filter-darker',
      },
      {
        split: false,
        variant: 'destructive',
        class: 'intent:bg-destructive/90',
      },
      {
        split: false,
        variant: 'outline',
        class: 'intent:bg-on-surface/8',
      },
      {
        split: false,
        variant: 'secondary',
        class: ' intent:bg-tertiary-container/80',
      },
      {
        split: false,
        variant: 'ghost',
        class: 'intent:bg-on-surface/8',
      },
      {
        split: false,
        variant: 'link',
        class: 'intent:underline',
      },
    ],
  },
);

type ButtonVariants = Omit<VariantProps<typeof buttonVariants>, 'icon'> &
  ({ icon: true; label: string } | { icon?: boolean; label?: string });
type BaseProps<T extends ValidComponent> = DynamicProps<T> & ButtonVariants;

const BaseComponent = <T extends ValidComponent>(ownProps: BaseProps<T>) => {
  const [local, props] = splitProps(ownProps as BaseProps<'button'>, [
    'size',
    'loading',
    'variant',
    'split',
    'icon',
    'label',
    'title',
  ]);
  return (
    <Dynamic
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
      aria-label={local.label}
      title={local.title ?? local.label}
      class={tw(buttonVariants(local), props.class)}
      onClick={(event: MouseEvent) => {
        if (local.loading) {
          event.preventDefault();
          return;
        }
        // @ts-expect-error Not all constituents of type 'EventHandlerUnion<HTMLButtonElement, MouseEvent>' are callable.Type 'BoundEventHandler<HTMLButtonElement, MouseEvent>' has no call signatures.ts(2349)
        props.onClick?.(event);
      }}
      aria-disabled={local.loading || undefined}
    >
      {props.children}
      <Show when={local.loading}>
        <div class="absolute inset-0 z-20 flex cursor-default items-center justify-center rounded-[inherit] bg-[inherit]">
          <Spinner size={local.size} />
        </div>
      </Show>
    </Dynamic>
  );
};

const Button = (ownProps: Omit<BaseProps<'button'>, 'component' | 'split'>) => {
  const props = mergeDefaultProps(ownProps, {
    type: 'button',
  });
  return <BaseComponent {...props} component="button" />;
};

const ButtonLink = (
  ownProps: Omit<BaseProps<typeof A>, 'component' | 'split'>,
) => {
  /**
   * When link={false} should use <a> without any link attribute
   * @link https://github.com/solidjs/solid-router/discussions/321
   */
  const [local, props] = splitProps(ownProps, ['link']);
  return (
    <BaseComponent {...props} component={local.link === false ? 'a' : A} />
  );
};

const SplitButton = (
  ownProps: Omit<BaseProps<'div'>, 'component' | 'icon' | 'split'>,
) => {
  return <BaseComponent {...ownProps} split component="div" />;
};
SplitButton.Inner = (ownProps: Omit<BaseProps<'button'>, 'component'>) => {
  return <Button {...ownProps} size="sm" variant="ghost" />;
};

export { Button, ButtonLink, SplitButton };
