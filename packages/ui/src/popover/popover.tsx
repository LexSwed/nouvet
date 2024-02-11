import { createPresence } from '@solid-primitives/presence';
import { mergeRefs } from '@solid-primitives/refs';
import {
  createEffect,
  createMemo,
  createSignal,
  splitProps,
  type Accessor,
  type ComponentProps,
  type JSX,
  type ValidComponent,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { tw } from '../tw';
import { composeEventHandlers, mergeDefaultProps } from '../utils';

import { createFloating, type OffsetOptions, type Placement } from './floating';

import * as cssStyles from './popover.module.css';

type PopoverProps<T extends ValidComponent> = Omit<
  ComponentProps<T>,
  'id' | 'children' | 'role'
> & {
  placement?: Placement | 'center';
  offset?: OffsetOptions;
  id: string;
  children?: JSX.Element | ((open: Accessor<boolean>) => JSX.Element);
  role?: 'dialog' | 'menu';
  /** @default 'div' */
  as?: T | undefined;
};

const Popover = <T extends ValidComponent = 'div'>(
  ownProps: PopoverProps<T>,
) => {
  const [popover, setPopover] = createSignal<HTMLElement | null>(null);
  const [trigger, setTrigger] = createSignal<HTMLElement | null>(null);
  const [rendered, setRendered] = createSignal(false);

  const [local, floatingProps, props] = splitProps(
    mergeDefaultProps(ownProps as PopoverProps<'div'>, {
      as: 'div',
      role: 'dialog' as const,
    }),
    ['id', 'ref', 'class', 'as', 'role', 'children'],
    ['offset', 'placement'],
  );

  const { isMounted } = createPresence(rendered, {
    enterDuration: 240,
    exitDuration: 100,
  });

  const component = () => local.as ?? 'div';
  const children = createMemo(() => {
    const child = local.children;
    return typeof child === 'function' ? child?.(isMounted) : child;
  });

  const data = createMemo(() => {
    const { placement, offset } = floatingProps;
    if (placement === 'center') {
      return { style: undefined, placement };
    }
    return createFloating(() => (rendered() ? trigger() : null), popover, {
      placement,
      offset,
    });
  });

  createEffect(() => {
    // filter out potential close buttons inside the popover
    const trigger = Array.from(
      document.querySelectorAll(`[popovertarget="${local.id}"]`),
    ).find((button) => !popover()?.contains(button));
    if (!(trigger instanceof HTMLElement)) return;
    setTrigger(trigger);
  });

  return (
    <Dynamic
      popover="auto"
      component={component()}
      {...props}
      style={data().style}
      data-placement={data().placement}
      id={local.id}
      role={local.role}
      tabIndex={0}
      ref={mergeRefs(local.ref, setPopover)}
      class={tw(cssStyles.popover, local.class)}
      children={children()}
      onBeforeToggle={composeEventHandlers(props.onBeforeToggle, (event) => {
        setRendered(event.newState === 'open');
      })}
      onToggle={composeEventHandlers(props.onToggle, (event) => {
        if (event.newState === 'open') {
          popover()?.focus();
        }
      })}
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
