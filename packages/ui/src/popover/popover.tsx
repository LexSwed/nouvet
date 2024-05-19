import { createPresence } from '@solid-primitives/presence';
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

import { tw } from '../tw';
import { composeEventHandlers, mergeDefaultProps, type Merge } from '../utils';

import * as cssStyles from './popover.module.css';

type BlockAlign = 'top' | 'bottom';
type InlineAlign = 'left' | 'right';
type BlockPlacement = `${BlockAlign}-to-${BlockAlign}`;
type InlinePlacement = `${InlineAlign}-to-${InlineAlign}`;

type Placement =
  | 'center'
  | BlockPlacement
  | InlinePlacement
  | `${BlockPlacement} ${InlinePlacement}`;

export type PopoverProps<T extends ValidComponent> = Merge<
  ComponentProps<T>,
  {
    /**
     * See @link https://developer.chrome.com/blog/anchor-positioning-api
     * 'center' makes popover appear as a dialog, not attached to the anchor.
     * Offset is controlled via margin:
     * @example class='ms-2 mt-2'
     *
     * @default 'block-end-bottom inline-end-left'
     */
    placement?: Placement;
    id: string;
    role?: 'dialog' | 'menu';
    children: JSX.Element | ((open: Accessor<boolean>) => JSX.Element);
    style?: JSX.CSSProperties;
    /** @default 'div' */
    as?: T | undefined;
  }
>;

const Popover = <T extends ValidComponent = 'div'>(
  ownProps: PopoverProps<T>,
) => {
  const [popover, setPopover] = createSignal<HTMLElement | null>(null);
  const [rendered, setRendered] = createSignal(false);

  const [local, props] = splitProps(
    mergeDefaultProps(ownProps as PopoverProps<'div'>, {
      as: 'div',
      role: 'dialog' as const,
      popover: 'auto',
      placement: 'top-to-bottom left-to-left',
    }),
    ['id', 'ref', 'class', 'style', 'as', 'role', 'placement', 'children'],
  );

  const { isMounted } = createPresence(rendered, {
    enterDuration: 0,
    exitDuration: 200,
  });

  const component = () => local.as ?? 'div';

  const resolved = createMemo(() => {
    const child = local.children;
    return typeof child === 'function' ? child(isMounted) : child;
  });
  const styles = (): JSX.CSSProperties | undefined => {
    if (local.placement === 'center') {
      return local.style;
    }
    const propertyToLogical = {
      top: 'inset-block-start',
      left: 'inset-inline-start',
      bottom: 'inset-block-end',
      right: 'inset-inline-end',
    } as const;
    const anchorToLogical = {
      top: 'start',
      left: 'start',
      bottom: 'end',
      right: 'end',
    } as const;

    const alignmentStyles = local.placement.split(' ').map((placement) => {
      const [popoverSide, anchorSide] = placement.split('-to-');
      return [
        `${propertyToLogical[popoverSide as BlockAlign | InlineAlign]}`,
        `anchor(${anchorToLogical[anchorSide as BlockAlign | InlineAlign]})`,
      ];
    });

    const style: JSX.CSSProperties = {
      ...local.style,
      'position-anchor': `--anchor-${local.id}`,
      ...Object.fromEntries(alignmentStyles),
    };
    return style;
  };

  return (
    <Dynamic
      component={component()}
      {...props}
      data-placement={local.placement}
      style={styles()}
      id={local.id}
      role={local.role}
      tabIndex={0}
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
    }
    interface CSSProperties {
      'view-transition-name'?: string;
      'position-anchor'?: string;
      'anchor-name'?: string;
      'inset-area'?: string;
    }
  }
}
