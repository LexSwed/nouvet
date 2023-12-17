import { A, type AnchorProps } from '@solidjs/router';
import { cva, type VariantProps } from 'class-variance-authority';
import { type JSX, splitProps, type ValidComponent, Show } from 'solid-js';
import { Dynamic, type DynamicProps } from 'solid-js/web';
import { mergeDefaultProps } from '../merge-default-props';
import { tw } from './tw';
import { Spinner } from './spinner';

const buttonVariants = cva(
  'relative ring-offset-background focus-visible:ring-outline inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-on-primary intent:bg-primary/90 focus-visible:ring-primary',
        destructive:
          'bg-destructive text-on-destructive intent:bg-destructive/90',
        outline:
          'border-input bg-background intent:bg-accent intent:text-on-accent border',
        secondary: 'bg-secondary text-on-secondary intent:bg-secondary/80',
        ghost: 'intent:bg-accent intent:text-on-accent',
        link: 'text-primary underline-offset-4 intent:underline',
      },
      size: {
        default: 'h-12 min-w-[theme(spacing.12)] px-4 py-2 text-base',
        sm: 'h-10 min-w-[theme(spacing.10)] min-w-[3rem] rounded-md px-3 text-base',
        lg: 'h-14 min-w-[theme(spacing.14)] rounded-md px-8 text-lg',
        cta: 'h-16 min-w-[theme(spacing.16)] rounded-full px-8 text-lg',
      },
      loading: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

const BaseComponent = <T extends ValidComponent>(
  ownProps: ButtonVariants & DynamicProps<T>,
) => {
  const [local, props] = splitProps(ownProps, ['size', 'loading', 'variant']);
  return (
    <Dynamic
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
        <div class="absolute inset-0 z-20 flex cursor-default items-center justify-center rounded-[inherit] bg-primary">
          <Spinner />
        </div>
      </Show>
    </Dynamic>
  );
};

interface ButtonProps
  extends JSX.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {}

const Button = (ownProps: ButtonProps) => {
  const props = mergeDefaultProps(
    {
      type: 'button',
    },
    ownProps,
  );
  return <BaseComponent component="button" {...props} />;
};

interface LinkProps extends AnchorProps, ButtonVariants {}

export const ButtonLink = (ownProps: LinkProps) => {
  /**
   * When link={false} should use <a> without any link attribute
   * @link https://github.com/solidjs/solid-router/discussions/321
   */
  const [local, props] = splitProps(ownProps, ['link']);
  return (
    <BaseComponent {...props} component={local.link === false ? 'a' : A} />
  );
};

export { Button };
