import { A } from '@solidjs/router';
import { Show, splitProps, type ValidComponent } from 'solid-js';
import { Dynamic, type DynamicProps } from 'solid-js/web';
import { cva, type VariantProps } from 'class-variance-authority';

import { Spinner } from './spinner';
import { tw } from './tw';
import { mergeDefaultProps } from './utils';

export const buttonVariants = cva(
  'relative inline-flex cursor-default items-center justify-center rounded-md text-sm font-medium transition-[filter,colors] focus-visible:outline-4 focus-visible:outline-offset-4 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary-container text-on-primary-container intent:filter-darker outline-primary',
        destructive:
          'bg-destructive text-on-destructive intent:bg-destructive/90 outline-destructive',
        outline:
          'border-outline text-on-surface outline-on-surface intent:bg-on-surface/8 rounded-full border bg-transparent',
        secondary:
          'bg-tertiary-container text-on-tertiary-container intent:bg-tertiary-container/80 outline-tertiary rounded-full',
        ghost: 'intent:bg-on-surface/8 text-on-surface outline-on-surface',
        link: 'text-primary intent:underline underline-offset-4',
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
    },
    defaultVariants: {
      variant: 'default',
      size: 'base',
      icon: false,
    },
  },
);

type ButtonVariants = Omit<VariantProps<typeof buttonVariants>, 'icon'>;
type ButtonWithIcon<P extends ButtonVariants> = P extends { icon: true }
  ? { icon: true; label: string }
  : { icon?: boolean; label?: string };
type BaseProps<T extends ValidComponent> = DynamicProps<T> &
  ButtonVariants &
  ButtonWithIcon<ButtonVariants>;

const BaseComponent = <T extends ValidComponent>(ownProps: BaseProps<T>) => {
  const [local, props] = splitProps(ownProps as BaseProps<'button'>, [
    'size',
    'loading',
    'variant',
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
      aria-disabled={local.loading}
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

const Button = (ownProps: Omit<BaseProps<'button'>, 'component'>) => {
  const props = mergeDefaultProps(ownProps, {
    type: 'button',
  });
  return <BaseComponent {...props} component="button" />;
};

const ButtonLink = (ownProps: Omit<BaseProps<typeof A>, 'component'>) => {
  /**
   * When link={false} should use <a> without any link attribute
   * @link https://github.com/solidjs/solid-router/discussions/321
   */
  const [local, props] = splitProps(ownProps, ['link']);
  return (
    <BaseComponent {...props} component={local.link === false ? 'a' : A} />
  );
};

export { Button, ButtonLink };
