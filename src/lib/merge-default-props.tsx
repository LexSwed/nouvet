import { mergeProps } from 'solid-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mergeDefaultProps<T extends Record<string, any>>(
  defaultProps: Partial<T>,
  props: T,
): T {
  const mergedProps = mergeProps(defaultProps, props);
  return mergedProps;
}
