import type { ComponentProps } from 'solid-js';

import { tw } from './tw';

const Divider = (props: ComponentProps<'div'>) => {
  return (
    <div
      role="separator"
      {...props}
      class={tw('m-0 border-t-[1px] border-on-surface/12', props.class)}
    />
  );
};

export { Divider };
