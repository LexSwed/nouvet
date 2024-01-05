import {
  computePosition,
  offset as offsetMiddleware,
  type ComputePositionConfig,
  type ComputePositionReturn,
  type ReferenceElement,
  type OffsetOptions,
  inline,
  autoUpdate,
  flip,
} from '@floating-ui/dom';
import { createEffect, createSignal, onCleanup, type JSX } from 'solid-js';
export { type Placement, type OffsetOptions } from '@floating-ui/dom';

export interface FloatingOptions<
  R extends ReferenceElement,
  F extends HTMLElement,
> {
  placement?: ComputePositionConfig['placement'];
  offset?: OffsetOptions;
  whileElementsMounted?: (
    reference: R,
    floating: F,
    update: () => void,
  ) => void | (() => void);
}

interface FloatingState extends Omit<ComputePositionReturn, 'x' | 'y'> {
  x?: number | null;
  y?: number | null;
}

export interface FloatingResult extends FloatingState {
  style: JSX.CSSProperties | undefined;
  update(): void;
}

const strategy = 'absolute' as const;

export function createFloating<
  R extends ReferenceElement,
  F extends HTMLElement,
>(
  reference: () => R | undefined | null,
  floating: () => F | undefined | null,
  options?: FloatingOptions<R, F>,
): FloatingResult {
  const placement = () => options?.placement ?? 'bottom';
  const offset = () => options?.offset ?? 8;

  const [data, setData] = createSignal<FloatingState>({
    x: null,
    y: null,
    placement: placement(),
    strategy,
    middlewareData: {},
  });

  function update() {
    const currentReference = reference();
    const currentFloating = floating();

    if (currentReference && currentFloating) {
      computePosition(currentReference, currentFloating, {
        middleware: [
          inline(),
          flip({ padding: 8 }),
          offsetMiddleware(offset()),
        ],
        placement: placement(),
        strategy,
      })
        .then((currentData) => {
          // Check if it's still valid
          if (
            currentFloating === floating() &&
            currentReference === reference()
          ) {
            setData(currentData);
          }
        })
        .catch(() => {});
    }
  }

  createEffect(() => {
    const currentReference = reference();
    const currentFloating = floating();

    let clear: ReturnType<typeof autoUpdate> | undefined;
    if (currentReference && currentFloating) {
      clear = autoUpdate(currentReference, currentFloating, update);
      onCleanup(clear);
    } else {
      clear?.();
    }
  });

  return {
    get style() {
      if (typeof data().x !== 'number' || typeof data().y !== 'number') {
        return undefined;
      }
      return {
        'inset': 'unset',
        'inset-inline-start': `${data().x}px`,
        'inset-block-start': `${data().y}px`,
        'position': strategy,
      };
    },
    get x() {
      return data().x;
    },
    get y() {
      return data().y;
    },
    get placement() {
      return data().placement;
    },
    get middlewareData() {
      return data().middlewareData;
    },
    strategy,
    update,
  };
}
