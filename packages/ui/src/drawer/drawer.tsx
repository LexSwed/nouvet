import { createMediaQuery } from '@solid-primitives/media';
import { mergeRefs } from '@solid-primitives/refs';
import {
  children,
  createSignal,
  Match,
  Show,
  splitProps,
  Switch,
  type ComponentProps,
  type ParentProps,
} from 'solid-js';
import Corvu from 'corvu/drawer';

import { Popover } from '../popover';
import { tw } from '../tw';
import { composeEventHandlers } from '../utils';

import cssStyles from './drawer.module.css';

const Content = (ownProps: ComponentProps<'div'>) => {
  const [open, setOpen] = createSignal(false);
  const [local, props] = splitProps(ownProps, ['children', 'class']);
  let popoverEl: HTMLElement | null;

  return (
    <Corvu.Root
      open={open()}
      closeOnEscapeKeyDown={false}
      closeOnOutsidePointer={false}
      trapFocus={false}
      restoreFocus={false}
      role="dialog"
      onOpenChange={(open) => {
        // swiped away
        setOpen(open);
        if (!popoverEl?.matches(':popover-open')) popoverEl?.hidePopover();
      }}
    >
      <Corvu.Content
        as="div"
        forceMount
        popover="auto"
        role="dialog"
        tabIndex={0}
        class={tw(cssStyles.drawer, local.class)}
        onToggle={composeEventHandlers(props.onToggle, (event) => {
          setOpen(event.newState === 'open');
          if (event.newState === 'open') {
            (event.currentTarget as HTMLElement).focus();
          }
        })}
        onFocusOut={composeEventHandlers(props.onFocusOut, (event) => {
          if (
            !(event.currentTarget as HTMLElement).contains(
              event.relatedTarget as Node,
            )
          ) {
            (event.currentTarget as HTMLElement).hidePopover();
          }
        })}
        {...(props as ComponentProps<typeof Corvu.Content>)}
        // @ts-expect-error ref element mismatch
        ref={mergeRefs(ownProps.ref, (el: HTMLElement) => (popoverEl = el))}
      >
        <Show when={open()}>
          <div class="grid w-full place-content-center pb-3 pt-2">
            <div class="bg-on-surface/30 h-1 w-8 rounded-full" />
          </div>
          {local.children}
        </Show>
      </Corvu.Content>
    </Corvu.Root>
  );
};

const Drawer = (
  ownProps: Omit<ComponentProps<typeof Popover>, 'children'> & ParentProps,
) => {
  const isMobile = createMediaQuery(
    // @screen(sm)
    '(max-width: 640px)',
    true,
  );
  const [local, props] = splitProps(ownProps, ['children']);
  const child = children(() => local.children);
  return (
    <Switch>
      <Match when={isMobile()}>
        <Content {...props} children={child()} />
      </Match>
      <Match when={!isMobile()}>
        <Popover {...props} id={props.id} children={child()} />
      </Match>
    </Switch>
  );
};

export { Drawer };
