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

type BaseProps<T extends ValidComponent, P = ComponentProps<T>> = {
  [K in keyof P]: P[K];
};
type Override<T1, T2> = Omit<T1, keyof T2> & T2;

type PopupProps<T extends ValidComponent> = Override<
  BaseProps<T>,
  {
    id: string;
    children?: JSX.Element | ((open: Accessor<boolean>) => JSX.Element);
    /** @default 'div' */
    as?: T | undefined;
  } & VariantProps<typeof popupVariants>
>;

const Popup = <T extends ValidComponent = 'div'>(ownProps: PopupProps<T>) => {
  const [popover, setPopover] = createSignal<HTMLElement | null>(null);
  const [trigger, setTrigger] = createSignal<HTMLElement | null>(null);
  const [rendered, setRendered] = createSignal(false);

  const [local, styles, props] = splitProps(
    mergeDefaultProps(ownProps as PopupProps<'div'>, {
      as: 'div',
      role: 'dialog' as const,
    }),
    ['id', 'ref', 'class', 'as', 'role', 'children'],
    ['variant'],
  );

  const component = () => local.as ?? 'div';
  const children = createMemo(() => {
    const child = local.children;
    return typeof child === 'function' ? child?.(rendered) : child;
  });

  createEffect(
    on(
      () => local.id,
      () => {
        const trigger = Array.from(
          document.querySelectorAll(`[popovertarget="${local.id}"]`),
        ).find((button) => !popover()?.contains(button));
        if (!(trigger instanceof HTMLElement)) return;
        // trigger.setAttribute('aria-haspopup', local.role!);
        // trigger.setAttribute('aria-controls', local.id);
        setTrigger(trigger);
        const hideOnBlur = (event: FocusEvent) => {
          if (!popover()?.contains(event.relatedTarget as Node)) {
            popover()!.hidePopover();
          }
        };
        trigger.addEventListener('focusout', hideOnBlur);
        onCleanup(() => {
          // trigger.removeAttribute('aria-haspopup');
          // trigger.removeAttribute('aria-controls');
          trigger.removeEventListener('focusout', hideOnBlur);
        });
      },
    ),
  );

  return (
    <Dynamic
      popover="auto"
      component={component()}
      {...props}
      id={local.id}
      role={local.role}
      tabIndex={0}
      ref={mergeRefs(local.ref, setPopover)}
      class={tw(popupVariants(styles), local.class)}
      onBeforeToggle={composeEventHandlers(props.onBeforeToggle, (event) => {
        setRendered(event.newState === 'open');
      })}
      onToggle={composeEventHandlers(props.onToggle, (event) => {
        if (event.newState === 'open') {
          popover()?.focus();
        }
      })}
      onFocusOut={composeEventHandlers(props.onFocusOut, (event) => {
        if (
          !popover()?.contains(event.relatedTarget as Node) &&
          // do no hide popup on toggle element pointerdown - it will toggle popup back on on pointerup
          event.relatedTarget !== trigger()
        ) {
          popover()?.hidePopover();
        }
      })}
      children={children()}
    />
  );
};

type PopoverProps<T extends ValidComponent> = PopupProps<T> & {
  placement?: Placement;
  offset?: OffsetOptions;
};

const Popover = <T extends ValidComponent = 'div'>(
  ownProps: PopoverProps<T>,
) => {
  const [popover, setPopover] = createSignal<HTMLElement | null>(null);
  const [trigger, setTrigger] = createSignal<HTMLElement | null>(null);

  const [floatingProps, props] = splitProps(
    mergeDefaultProps(ownProps as PopoverProps<'div'>, {
      as: 'div',
      role: 'dialog' as const,
    }),
    ['offset', 'placement'],
  );

  const data = createFloating(trigger, popover, floatingProps);

  return (
    <Popup
      style={data.style}
      data-placement={data.placement}
      {...props}
      ref={mergeRefs(props.ref, setPopover)}
      onBeforeToggle={composeEventHandlers(props.onBeforeToggle, (event) => {
        if (!props.id) return;
        // filter out potential close buttons inside the popover
        const trigger = Array.from(
          document.querySelectorAll(`[popovertarget="${props.id}"]`),
        ).find((button) => !popover()?.contains(button));
        if (!(trigger instanceof HTMLElement)) return;
        if (event.newState === 'open') {
          setTrigger(trigger);
        }
      })}
      onToggle={composeEventHandlers(props.onToggle, (event) => {
        if (event.newState === 'closed') {
          // we need to remove the reference for floating to remove listeners
          setTrigger(null);
        }
      })}
    />
  );
};

export { Popup, Popover };

/* eslint-disable @typescript-eslint/no-namespace */
declare module 'solid-js' {
  namespace JSX {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      onBeforeToggle?: EventHandlerUnion<T, ToggleEvent>;
      onToggle?: EventHandlerUnion<T, ToggleEvent>;
    }
  }
}
