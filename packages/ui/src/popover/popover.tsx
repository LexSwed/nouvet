import { mergeRefs } from '@solid-primitives/refs';
import {
  children,
  createMemo,
  createSignal,
  Show,
  splitProps,
  type Accessor,
  type ComponentProps,
  type JSX,
  type ValidComponent,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { Text } from '../text';
import { tw } from '../tw';
import { composeEventHandlers, mergeDefaultProps, type Merge } from '../utils';

import css from './popover.module.css';

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
     * Popover heading/title/header/headline.
     */
    heading?: JSX.Element;
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
  const [shownState, setShownState] = createSignal<
    'closed' | 'open' | 'hiding'
  >('closed');

  const [local, props] = splitProps(
    mergeDefaultProps(ownProps as PopoverProps<'div'>, {
      as: 'div',
      role: 'dialog' as const,
      popover: 'auto',
      placement: 'top-to-bottom left-to-left',
    }),
    [
      'id',
      'ref',
      'heading',
      'class',
      'style',
      'as',
      'role',
      'placement',
      'children',
    ],
  );

  const component = () => local.as ?? 'div';

  const resolved = createMemo(() => {
    const child = local.children;
    return typeof child === 'function'
      ? child(() => shownState() !== 'closed')
      : child;
  });
  const heading = children(() => local.heading);

  return (
    <Dynamic
      component={component()}
      {...props}
      data-placement={local.placement}
      style={{
        ...local.style,
        ...inlineAnchoring(local.id, local.placement),
      }}
      id={local.id}
      role={local.role}
      tabIndex={0}
      ref={mergeRefs(local.ref, setPopover)}
      class={tw(css.popover, local.class)}
      onBeforeToggle={composeEventHandlers(props.onBeforeToggle, (event) => {
        if (event.newState === 'open') {
          setShownState('open');
        } else {
          setShownState('hiding');
        }
      })}
      onToggle={composeEventHandlers(props.onToggle, (event) => {
        if (event.newState === 'open') {
          popover()?.focus();
        } else {
          Promise.allSettled(
            popover()
              ?.getAnimations()
              .map((a) => a.finished) || [],
          ).finally(() => {
            if (shownState() === 'hiding') {
              setShownState('closed');
            }
          });
        }
      })}
      aria-labelledby={heading() ? `${local.id}-heading` : undefined}
    >
      <Show when={heading()}>
        <Text
          with="headline-3"
          as="header"
          id={`${local.id}-heading`}
          class="mb-4"
        >
          {heading()}
        </Text>
      </Show>
      {resolved()}
    </Dynamic>
  );
};

export { Popover };

function inlineAnchoring(
  id: string,
  placement: Placement,
): JSX.CSSProperties | undefined {
  if (placement === 'center') {
    /** TODO: remove whn Chromium bug is fixed with centered popover failing the page */
    return {
      'position-anchor': `--anchor-${id}`,
    };
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

  const alignmentStyles = placement.split(' ').map((placement) => {
    const [popoverSide, anchorSide] = placement.split('-to-');
    return [
      `${propertyToLogical[popoverSide as BlockAlign | InlineAlign]}`,
      `anchor(${anchorToLogical[anchorSide as BlockAlign | InlineAlign]})`,
    ];
  });

  const style: JSX.CSSProperties = {
    'position-anchor': `--anchor-${id}`,
    ...Object.fromEntries(alignmentStyles),
  };
  return style;
}

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
