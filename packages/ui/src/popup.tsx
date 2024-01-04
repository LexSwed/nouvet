/* eslint-disable @typescript-eslint/no-namespace */
import { mergeRefs } from '@solid-primitives/refs';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  splitProps,
  type JSX,
  createSignal,
  createMemo,
  type Accessor,
} from 'solid-js';
import { createFloating, type OffsetOptions, type Placement } from './floating';
import { tw } from './tw';
import { composeEventHandlers } from './utils';

const popupVariants = cva(
  'rounded-md m-0 bg-surface shadow-md p-1 overflow-y-auto max-h-60 empty:hidden',
  {
    variants: {
      variant: {
        list: 'p-1',
        popup: 'p-3',
      },
    },
    defaultVariants: {
      variant: 'popup',
    },
  },
);

interface PopupProps
  extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof popupVariants> {
  id: string;
  children?: JSX.Element | ((open: Accessor<boolean>) => JSX.Element);
  placement?: Placement;
  offset?: OffsetOptions;
}
const Popup = (ownProps: PopupProps) => {
  const [popover, setPopover] = createSignal<HTMLDivElement | null>(null);
  const [trigger, setTrigger] = createSignal<HTMLElement | null>(null);
  const [rendered, setRendered] = createSignal(false);

  const data = createFloating(trigger, popover, ownProps);

  const [local, styles, props] = splitProps(
    ownProps,
    ['id', 'ref', 'class', 'children'],
    ['variant'],
  );

  const children = createMemo(() => {
    const child = local.children;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return typeof child === 'function' ? (child as any)(rendered) : child;
  });

  return (
    <div
      popover="auto"
      {...props}
      id={local.id}
      style={data.style}
      tabIndex={0}
      ref={mergeRefs(local.ref, setPopover)}
      class={tw(popupVariants(styles), local.class)}
      onBeforeToggle={composeEventHandlers(props.onBeforeToggle, (event) => {
        setRendered(event.newState === 'open');
        if (!local.id) return;
        const trigger = document.querySelector(`[popovertarget="${local.id}"]`);
        if (!trigger) return;
        trigger.setAttribute(
          'aria-expanded',
          event.newState === 'open' ? 'true' : 'false',
        );
        if (event.newState === 'open') {
          setTrigger(trigger as HTMLElement);
        }
      })}
      onToggle={composeEventHandlers(props.onToggle, (event) => {
        if (event.newState === 'open') {
          popover()?.focus();
        }
      })}
      onBlur={composeEventHandlers(props.onBlur, (event) => {
        if (!popover()?.contains(event.relatedTarget as Node)) {
          trigger()?.focus();
          popover()?.hidePopover();
        }
      })}
      children={children()}
    />
  );
};

export { Popup };

declare module 'solid-js' {
  namespace JSX {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      onBeforeToggle?: EventHandlerUnion<T, ToggleEvent>;
      onToggle?: EventHandlerUnion<T, ToggleEvent>;
    }
  }
}

/* 
@layer fxtrot-ui {
  .popover {
    border-radius: theme('borderRadius.md');
    background-color: theme('colors.surface');
    box-shadow: theme('boxShadow.popper');
    animation-timing-function: ease-in;
    animation-fill-mode: forwards;
    animation-duration: 0.15s;
    --translate-offset: 5px;
    --translate: calc(var(--translate-x, 0) * var(--translate-offset)),
      calc(var(--translate-y, 0) * var(--translate-offset));

    &:where([data-state='open']) {
      animation-duration: 0.15s;
      animation-name: slide-in;
    }
    &:where([data-state='closed']) {
      animation-duration: 0.1s;
      animation-name: slide-out;
    }
    &:where([data-side='top']) {
      --translate-y: 1;
    }
    &:where([data-side='bottom']) {
      --translate-y: -1;
    }
    &:where([data-side='right']) {
      --translate-x: -1;
    }
    &:where([data-side='left']) {
      --translate-x: 1;
    }
    @media (prefers-reduced-motion: reduce) {
      animation-duration: 0s;
    }
  }

  @keyframes slide-in {
    0% {
      opacity: 0;
      transform: translate3d(var(--translate), 0);
    }
    60% {
      opacity: 1;
    }
    100% {
      opacity: 1;
      transform: none;
    }
  }
  @keyframes slide-out {
    0% {
      opacity: 1;
      transform: none;
    }
    100% {
      opacity: 0;
      transform: translate3d(var(--translate), 0);
    }
  }
} */
