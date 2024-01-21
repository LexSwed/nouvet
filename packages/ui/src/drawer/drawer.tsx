import { splitProps, type ComponentProps } from 'solid-js';
import CorvuDrawer from 'corvu/drawer';

import { Button } from '../button';
import { tw } from '../tw';

import cssStyles from './drawer.module.css';

const Trigger = (props: ComponentProps<typeof Button>) => {
  // @ts-expect-error Trigger props mismatch with custom Button
  return <CorvuDrawer.Trigger {...props} as={Button} />;
};
const Content = (ownProps: ComponentProps<typeof CorvuDrawer.Content>) => {
  const [local, props] = splitProps(ownProps, ['class']);
  return (
    <CorvuDrawer.Content
      as="dialog"
      {...props}
      class={tw(
        cssStyles.content,
        'block p-4 isolate m-0 h-max w-full ease-in-out inset-x-0 bottom-0 max-h-[500px] rounded-t-lg border-t-4 border-outline bg-surface lg:select-none',
        local.class,
      )}
    />
  );
};

const Drawer = {
  Root: CorvuDrawer.Root,
  Trigger,
  Content,
};

export { Drawer };
