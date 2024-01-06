import { mergeProps, type JSX, type MergeProps } from 'solid-js';

export type DefaultProps<T, K extends keyof T> = MergeProps<
  [Required<Pick<T, K>>, T]
>;
export function mergeDefaultProps<T, K extends keyof T>(
  props: T,
  defaults: Required<Pick<T, K>>,
): DefaultProps<T, K> {
  // eslint-disable-next-line solid/reactivity
  return mergeProps(defaults, props);
}

export function callHandler<T, E extends Event>(
  event: E & { currentTarget: T; target: Element },
  handler: JSX.EventHandlerUnion<T, E> | undefined,
) {
  if (handler) {
    if (typeof handler === 'function') {
      handler(event);
    } else {
      handler[0](handler[1], event);
    }
  }

  return event?.defaultPrevented;
}

/** Create a new event handler which calls all given handlers in the order they were chained with the same event. */
export function composeEventHandlers<T, E extends Event>(
  ...handlers: Array<JSX.EventHandlerUnion<T, E> | undefined>
) {
  return (event: E & { currentTarget: T; target: Element }) => {
    for (const handler of handlers) {
      callHandler(event, handler);
    }
  };
}
