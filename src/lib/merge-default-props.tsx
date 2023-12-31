import { mergeProps, type MergeProps } from 'solid-js';

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
