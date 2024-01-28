import { createPresence } from '@solid-primitives/presence';
import { Show, type Accessor, type ComponentProps } from 'solid-js';

import { mergeDefaultProps } from './utils';

type RequiredParameter<T> = T extends () => unknown ? never : T;
function Presence<
  T,
  TRenderFunction extends (item: Accessor<NonNullable<T>>) => JSX.Element,
>(ownProps: {
  when: T | undefined | null | false;
  fallback?: JSX.Element;
  children: JSX.Element | RequiredParameter<TRenderFunction>;
  transitionDuration?: number;
}) {
  const props = mergeDefaultProps(ownProps, {
    transitionDuration: 100,
  });
  const presence = createPresence(() => props.when, {
    transitionDuration: props.transitionDuration,
  });
  return (
    <Show
      when={presence.isMounted()}
      fallback={props.fallback as any}
      children={props.children as any}
    />
  );
}

export { Presence };
