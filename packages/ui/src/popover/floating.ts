import { useFloating } from 'solid-floating-ui';
import { batch, createEffect, type JSX } from 'solid-js';
import {
  autoUpdate,
  flip,
  inline,
  offset as offsetMiddleware,
  shift,
  type ComputePositionConfig,
  type ComputePositionReturn,
  type OffsetOptions,
  type ReferenceElement,
} from '@floating-ui/dom';

export { type Placement, type OffsetOptions } from '@floating-ui/dom';

export interface FloatingOptions {
  placement?: ComputePositionConfig['placement'];
  offset?: OffsetOptions;
}

interface FloatingState extends Omit<ComputePositionReturn, 'x' | 'y'> {
  x?: number | null;
  y?: number | null;
}

export interface FloatingResult extends FloatingState {
  style: JSX.CSSProperties | undefined;
}

const strategy = 'absolute' as const;

export function createFloating<
  R extends ReferenceElement,
  F extends HTMLElement,
>(
  reference: () => R | undefined | null,
  floating: () => F | undefined | null,
  options?: FloatingOptions,
): FloatingResult {
  const placement = () => options?.placement ?? 'bottom';
  const offset = () => options?.offset ?? 8;
  const position = useFloating(reference, floating, {
    middleware: [
      inline(),
      shift({ padding: 16 }),
      flip({ padding: 16 }),
      offsetMiddleware(offset()),
    ],
    placement: placement(),
    strategy,
    whileElementsMounted: (reference, floating, update) =>
      autoUpdate(reference, floating, () => {
        // do not calculate the position while popover is opening
        if (
          floating.getAttribute('popover')
            ? floating.matches(':popover-open')
            : true
        ) {
          requestAnimationFrame(update);
        }
      }),
  });

  return {
    get style() {
      return {
        inset: 'unset',
        top: `${position.y ?? 0}px`,
        left: `${position.x ?? 0}px`,
        position: strategy,
      };
    },
    get x() {
      return position.x;
    },
    get y() {
      return position.y;
    },
    get placement() {
      return position.placement;
    },
    get middlewareData() {
      return position.middlewareData;
    },
    strategy,
  };
}
