import { createMediaQuery } from '@solid-primitives/media';
import { Show, splitProps, type ComponentProps } from 'solid-js';
import CorvuDrawer from 'corvu/drawer';

import { Button } from '../button';
import { Popover } from '../popover';
import { tw } from '../tw';
import { composeEventHandlers } from '../utils';

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

const Content = (ownProps: ComponentProps<'div'> & { id: string }) => {
  const [local, props] = splitProps(ownProps, ['class']);
  const isSmall = createMediaQuery('(max-width: 600px)');
  const context = CorvuDrawer.useDialogContext();
  return (
    <Show
      when={isSmall()}
      children={
        <CorvuDrawer.Content
          as="div"
          popover="auto"
          {...(props as ComponentProps<typeof CorvuDrawer.Content>)}
          onToggle={composeEventHandlers(props.onToggle, (event) => {
            if (event.newState === 'open') {
              context.setOpen(true);
            } else {
              context.setOpen(false);
            }
          })}
          class={tw(cssStyles.content, cssStyles.drawer, local.class)}
        />
      }
      fallback={
        <Popover
          id={props.id}
          class={tw(cssStyles.drawer, local.class)}
          role="dialog"
        />
      }
    />
  );
};

const Drawer = {
  Root,
  Trigger,
  Content,
};

export { Drawer };
