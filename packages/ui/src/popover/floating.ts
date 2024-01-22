import {
  batch,
  createEffect,
  createSignal,
  onCleanup,
  type JSX,
} from 'solid-js';
import {
  autoUpdate,
  computePosition,
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
  update(): void;
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

  const [data, setData] = createSignal<FloatingState>({
    x: null,
    y: null,
    placement: placement(),
    strategy,
    middlewareData: {},
  });

  async function update() {
    const currentReference = reference();
    const currentFloating = floating();
    if (
      currentReference &&
      currentFloating &&
      (currentFloating.getAttribute('popover')
        ? currentFloating.matches(':popover-open')
        : true)
    ) {
      // avoids "ResizeObserver loop completed with undelivered notifications."
      // and invalid initial positioning (initial calculations happening multiple times, we only care about the last one);
      batch(async () => {
        try {
          const currentData = await computePosition(
            currentReference,
            currentFloating,
            {
              middleware: [
                inline(),
                shift({ padding: 16 }),
                flip({ padding: 16 }),
                offsetMiddleware(offset()),
              ],
              placement: placement(),
              strategy,
            },
          );
          if (
            currentData &&
            currentFloating === floating() &&
            currentReference === reference()
          ) {
            setData(currentData);
          }
        } catch (error) {
          console.error(error);
        }
      });
    }
  }

  createEffect(() => {
    const currentReference = reference();
    const currentFloating = floating();
    if (currentReference && currentFloating) {
      const clear = autoUpdate(currentReference, currentFloating, update);
      onCleanup(clear);
    }
  });

  return {
    get style() {
      return {
        inset: 'unset',
        top: `${data().y ?? 0}px`,
        left: `${data().x ?? 0}px`,
        position: strategy,
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
