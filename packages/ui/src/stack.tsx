import type { ComponentProps } from 'solid-js';

import { tw } from './tw';

const Stack = (props: ComponentProps<'div'>) => {
  return (
    <div
      {...props}
      class={tw('grid  [&>*]:col-start-1 [&>*]:row-start-1', props.class)}
    />
  );
};

export { Stack };
