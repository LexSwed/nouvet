import { createPresence } from '@solid-primitives/presence';
import { Show, type Accessor, type JSX } from 'solid-js';

import { mergeDefaultProps } from './utils';

function Presence(ownProps: {
  when: boolean | undefined | null | false;
  fallback?: JSX.Element;
  children:
    | JSX.Element
    | ((present: Accessor<NonNullable<boolean>>) => JSX.Element);
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
      fallback={props.fallback}
      children={props.children}
    />
  );
}

export { Presence };
