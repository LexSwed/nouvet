import { createMediaQuery } from '@solid-primitives/media';
import { Show, splitProps, type ComponentProps } from 'solid-js';
import CorvuDrawer from 'corvu/drawer';

import { Button } from '../button';
import { Popover } from '../popover';
import { tw } from '../tw';

import cssStyles from './drawer.module.css';

const Root = (props: ComponentProps<typeof CorvuDrawer.Root>) => {
  const isSmall = createMediaQuery('(max-width: 600px)');
  return (
    <Show
      when={isSmall()}
      children={<CorvuDrawer.Root {...props} />}
      fallback={<>{props.children}</>}
    />
  );
};

const Trigger = (props: ComponentProps<typeof Button>) => {
  const isSmall = createMediaQuery('(max-width: 600px)');
  return (
    <Show
      when={isSmall()}
      // @ts-expect-error Trigger props mismatch with custom Button
      children={<CorvuDrawer.Trigger {...props} as={Button} />}
      fallback={<Button {...props} />}
    />
  );
};

const Content = (
  ownProps: ComponentProps<typeof CorvuDrawer.Content> & { id: string },
) => {
  const [local, props] = splitProps(ownProps, ['class']);
  const isSmall = createMediaQuery('(max-width: 600px)');
  return (
    <Show
      when={isSmall()}
      children={
        <CorvuDrawer.Content
          popover
          {...props}
          class={tw(cssStyles.content, cssStyles.drawer, local.class)}
        />
      }
      fallback={<Popover role="dialog" class={tw(local.class)} {...props} />}
    />
  );
};

const Drawer = {
  Root,
  Trigger,
  Content,
};

export { Drawer };
