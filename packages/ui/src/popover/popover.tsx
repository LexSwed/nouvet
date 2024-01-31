import { createPresence } from '@solid-primitives/presence';
import { mergeRefs } from '@solid-primitives/refs';
import {
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
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

type PopoverProps<T extends ValidComponent> = Omit<
  ComponentProps<T>,
  'id' | 'children'
> & {
  placement?: Placement;
  offset?: OffsetOptions;
  id: string;
  children?: JSX.Element | ((open: Accessor<boolean>) => JSX.Element);
  /** @default 'div' */
  as?: T | undefined;
} & VariantProps<typeof popupVariants>;

const Popover = <T extends ValidComponent = 'div'>(
  ownProps: PopoverProps<T>,
) => {
  const [popover, setPopover] = createSignal<HTMLElement | null>(null);
  const [trigger, setTrigger] = createSignal<HTMLElement | null>(null);
  const [rendered, setRendered] = createSignal(false);

  const [local, styles, floatingProps, props] = splitProps(
    mergeDefaultProps(ownProps as PopoverProps<'div'>, {
      as: 'div',
      role: 'dialog' as const,
    }),
    ['id', 'ref', 'class', 'as', 'role', 'children'],
    ['variant'],
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

  const data = createFloating(trigger, popover, floatingProps);

  let outsidePointerDown = false;
  createEffect(() => {
    function onPointerDown() {
      outsidePointerDown = true;
    }
    function onPointerUp(event: PointerEvent) {
      outsidePointerDown = false;
      if (!popover()?.contains(event.target as HTMLElement)) {
        popover()?.hidePopover();
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointerup', onPointerUp);
    onCleanup(() => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointerup', onPointerUp);
    });
  });

  return (
    <Dynamic
      popover="auto"
      component={component()}
      {...props}
      style={data.style}
      data-placement={data.placement}
      id={local.id}
      role={local.role}
      tabIndex={0}
      ref={mergeRefs(local.ref, setPopover)}
      class={tw(popupVariants(styles), local.class)}
      onFocusOut={composeEventHandlers(props.onFocusOut, (event) => {
        if (
          !popover()?.contains(event.relatedTarget as Node) &&
          // do not hide popover on outside click, it will be handled separately
          !outsidePointerDown
        ) {
          popover()?.hidePopover();
        }
      })}
      children={children()}
      onBeforeToggle={composeEventHandlers(props.onBeforeToggle, (event) => {
        if (!local.id) return;
        setRendered(event.newState === 'open');
        // filter out potential close buttons inside the popover
        const trigger = Array.from(
          document.querySelectorAll(`[popovertarget="${local.id}"]`),
        ).find((button) => !popover()?.contains(button));
        if (!(trigger instanceof HTMLElement)) return;
        if (event.newState === 'open') {
          setTrigger(trigger);
        }
      })}
      onToggle={composeEventHandlers(props.onToggle, (event) => {
        if (event.newState === 'open') {
          popover()?.focus();
        } else {
          // we need to remove the reference for floating to remove listeners
          setTrigger(null);
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
