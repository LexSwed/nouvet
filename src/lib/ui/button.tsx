import { A } from '@solidjs/router';
import { cva, type VariantProps } from 'class-variance-authority';
import { type JSX, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { mergeDefaultProps } from '../merge-default-props';
import { tw } from './tw';

const buttonVariants = cva(
  'ring-offset-background focus-visible:ring-outline inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-on-primary hover:bg-primary/90 focus-visible:ring-primary',
        destructive:
          'bg-destructive text-on-destructive hover:bg-destructive/90',
        outline:
          'border-input bg-background hover:bg-accent hover:text-on-accent border',
        secondary: 'bg-secondary text-on-secondary hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-on-accent',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-12 px-4 py-2 text-base',
        sm: 'h-10 rounded-md px-3 text-base',
        lg: 'h-14 rounded-md px-8 text-lg',
        cta: 'h-16 rounded-full px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type ButtonVariants = VariantProps<typeof buttonVariants>;
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
  return (
    <button
      {...props}
      class={tw(
        buttonVariants({
          variant: props.variant,
          size: props.size,
        }),
        props.class,
      )}
    />
  );
};

interface LinkProps
  extends JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
    ButtonVariants {}

export const ButtonLink = (ownProps: LinkProps) => {
  /**
   * When link={false} should use <a> without any link attribute
   * @link https://github.com/solidjs/solid-router/discussions/321
   */
  const [local, props] = splitProps(ownProps, ['link']);
  return (
    <Dynamic
      {...props}
      component={local.link ? A : 'a'}
      class={tw(
        buttonVariants({
          variant: props.variant,
          size: props.size,
        }),
        props.class,
      )}
    />
  );
};

export { Button };
