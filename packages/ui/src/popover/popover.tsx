import { mergeRefs } from '@solid-primitives/refs';
import {
  createMemo,
  createSignal,
  splitProps,
  type Accessor,
  type ComponentProps,
  type JSX,
  type ValidComponent,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { cva, type VariantProps } from 'class-variance-authority';

import {
  createFloating,
  type OffsetOptions,
  type Placement,
} from '../popover/floating';
import { tw } from '../tw';
import { composeEventHandlers, mergeDefaultProps } from '../utils';

import * as cssStyles from './popover.module.css';

const popupVariants = cva(cssStyles.popover, {
  variants: {
    variant: {
      list: 'p-1',
      popup: 'p-3',
    },
  },
  defaultVariants: {
    variant: 'popup',
  },
});

type BaseProps<T extends ValidComponent, P = ComponentProps<T>> = {
  [K in keyof P]: P[K];
};
type Override<T1, T2> = Omit<T1, keyof T2> & T2;

type PopupProps<T extends ValidComponent> = Override<
  BaseProps<T>,
  {
    id: string;
    children?: JSX.Element | ((open: Accessor<boolean>) => JSX.Element);
    placement?: Placement;
    offset?: OffsetOptions;
    /** @default 'div' */
    as?: T | undefined;
    role?: 'menu' | 'dialog';
  } & VariantProps<typeof popupVariants>
>;

const Popover = <T extends ValidComponent = 'div'>(ownProps: PopupProps<T>) => {
  const [popover, setPopover] = createSignal<HTMLElement | null>(null);
  const [trigger, setTrigger] = createSignal<HTMLElement | null>(null);
  const [rendered, setRendered] = createSignal(false);

  const [local, styles, floatingProps, props] = splitProps(
    mergeDefaultProps(ownProps, { as: 'div' as T }) as PopupProps<'div'>,
    ['id', 'ref', 'class', 'as', 'children'],
    ['variant'],
    ['offset', 'placement'],
  );

  const data = createFloating(trigger, popover, floatingProps);

  const component = () => local.as ?? 'div';

  const children = createMemo(() => {
    const child = local.children;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return typeof child === 'function' ? (child as any)(rendered) : child;
  });

  return (
    <Dynamic
      popover="auto"
      component={component()}
      {...props}
      id={local.id}
      style={data.style}
      tabIndex={0}
      data-placement={data.placement}
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
      onFocusOut={composeEventHandlers(props.onFocusOut, (event) => {
        if (
          !popover()?.contains(event.relatedTarget as Node) &&
          event.relatedTarget !== trigger()
        ) {
          popover()?.hidePopover();
        }
      })}
      children={children()}
    />
  );
};

export { Popover };

/* eslint-disable @typescript-eslint/no-namespace */
declare module 'solid-js' {
  namespace JSX {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      onBeforeToggle?: EventHandlerUnion<T, ToggleEvent>;
      onToggle?: EventHandlerUnion<T, ToggleEvent>;
    }
  }
}
