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

import { createFloating, type FloatingOptions } from './floating';

import * as cssStyles from './popover.module.css';

export type PopoverProps<T extends ValidComponent> = Omit<
  ComponentProps<T>,
  'id' | 'role' | 'children'
> & {
  placement?: FloatingOptions['placement'] | 'center';
  offset?: FloatingOptions['offset'];
  strategy?: FloatingOptions['strategy'];
  id: string;
  role?: 'dialog' | 'menu';
  children: JSX.Element | ((open: Accessor<boolean>) => JSX.Element);
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
    ['offset', 'placement', 'strategy'],
  );

  const { isMounted } = createPresence(rendered, {
    enterDuration: 0,
    exitDuration: 200,
  });

  const component = () => local.as ?? 'div';

  const data = createMemo(() => {
    const { placement, offset, strategy } = floatingProps;
    if (placement === 'center') {
      return { style: undefined, placement };
    }
    return createFloating(() => (rendered() ? trigger() : null), popover, {
      placement,
      offset,
      strategy,
    });
  });

  createEffect(() => {
    // filter out potential close buttons inside the popover
    const trigger = Array.from(
      document.querySelectorAll(`[popovertarget="${local.id}"]`),
    ).find((button) => !popover()?.contains(button));
    if (!(trigger instanceof HTMLElement)) {
      throw new Error(`Popover ${local.id} trigger is not found`);
    }
    setTrigger(trigger);
  });
  const resolved = createMemo(() => {
    const child = local.children;
    return typeof child === 'function' ? child(isMounted) : child;
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
      autoFocus={true}
      ref={mergeRefs(local.ref, setPopover)}
      class={tw(cssStyles.popover, local.class)}
      onBeforeToggle={composeEventHandlers(props.onBeforeToggle, (event) => {
        setRendered(event.newState === 'open');
      })}
      onToggle={composeEventHandlers(props.onToggle, (event) => {
        if (event.newState === 'open') {
          popover()?.focus();
        }
      })}
      children={resolved()}
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
      anchor?: string;
    }
  }
}
