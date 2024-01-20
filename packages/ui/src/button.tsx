import { A, type AnchorProps } from '@solidjs/router';
import { Show, splitProps, type JSX, type ValidComponent } from 'solid-js';
import { Dynamic, type DynamicProps } from 'solid-js/web';
import { cva, type VariantProps } from 'class-variance-authority';

import { Spinner } from './spinner';
import { tw } from './tw';
import { composeEventHandlers, mergeDefaultProps } from './utils';

const buttonVariants = cva(
  'relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-4 focus-visible:outline-offset-4 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-on-primary intent:bg-primary/90 focus-visible:outline-primary',
        destructive:
          'bg-destructive text-on-destructive intent:bg-destructive/90 focus-visible:outline-destructive',
        outline:
          'border-input bg-background intent:bg-primary intent:text-on-primary border',
        secondary:
          'bg-tertiary-container text-on-tertiary-container intent:bg-tertiary-container/80 focus-visible:outline-tertiary rounded-full',
        ghost: 'hover:bg-on-surface/5 focus:bg-on-surface/8 text-on-surface',
        link: 'text-primary intent:underline underline-offset-4',
      },
      size: {
        default: 'h-12 min-w-12 px-4 py-2 text-base',
        sm: 'h-10 min-w-10 px-3 text-base',
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
      size: 'default',
      icon: false,
    },
  },
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

const BaseComponent = <T extends ValidComponent>(
  ownProps: ButtonVariants & DynamicProps<T>,
) => {
  const [local, props] = splitProps(ownProps, [
    'size',
    'loading',
    'variant',
    'icon',
  ]);
  return (
    <Dynamic
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
      class={tw(buttonVariants(local), props.class)}
      onClick={(event: MouseEvent) => {
        if (local.loading) {
          event.preventDefault();
          return;
        }
        props.onClick?.(event);
      }}
      aria-disabled={local.loading}
    >
      {props.children}
      <Show when={local.loading}>
        <div class="absolute inset-0 z-20 flex cursor-default items-center justify-center rounded-[inherit] bg-[inherit]">
          <Spinner />
        </div>
      </Show>
    </Dynamic>
  );
};

interface ButtonProps
  extends JSX.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  label?: string;
}

const Button = (ownProps: ButtonProps) => {
  const props = mergeDefaultProps(ownProps, {
    type: 'button',
  });
  return (
    <BaseComponent
      component="button"
      aria-label={props.label}
      title={props.title}
      aria-haspopup={props.popoverTarget ? 'true' : undefined}
      aria-controls={props.popoverTarget}
      {...props}
      onFocusOut={composeEventHandlers(props.onFocusOut, (event) => {
        if (props.popoverTarget) {
          const popover = document.getElementById(props.popoverTarget);
          if (!popover?.contains(event.relatedTarget as Node)) {
            popover?.hidePopover();
          }
        }
      })}
    />
  );
};

interface LinkProps extends AnchorProps, ButtonVariants {
  label?: string;
}

const ButtonLink = (ownProps: LinkProps) => {
  /**
   * When link={false} should use <a> without any link attribute
   * @link https://github.com/solidjs/solid-router/discussions/321
   */
  const [local, props] = splitProps(ownProps, ['link']);
  return (
    <BaseComponent
      {...props}
      aria-label={props.label}
      title={props.title}
      component={local.link === false ? 'a' : A}
    />
  );
};

export { Button, ButtonLink };
