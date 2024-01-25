import { createMediaQuery } from '@solid-primitives/media';
import { mergeRefs } from '@solid-primitives/refs';
import {
  Match,
  Show,
  splitProps,
  Switch,
  type ComponentProps,
  type ParentProps,
} from 'solid-js';
import Corvu from 'corvu/drawer';

import { Popover, type Popup } from '../popover/popover';
import { tw } from '../tw';
import { composeEventHandlers } from '../utils';

import cssStyles from './drawer.module.css';

const Content = (ownProps: ComponentProps<'div'>) => {
  const [local, props] = splitProps(ownProps, ['children', 'class']);
  const context = Corvu.useDialogContext();

  return (
    <Corvu.Content
      as="div"
      forceMount
      popover="auto"
      role="dialog"
      tabIndex={0}
      class={tw(cssStyles.drawer, local.class)}
      onBeforeToggle={composeEventHandlers(props.onBeforeToggle, (event) => {
        context.setOpen(event.newState === 'open');
      })}
      onToggle={composeEventHandlers(props.onToggle, (event) => {
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
    >
      <Show when={context.open()}>
        <div class="grid w-full place-content-center pb-3 pt-2">
          <div class="bg-on-surface/30 h-1 w-8 rounded-full" />
        </div>
        {local.children}
      </Show>
    </Corvu.Content>
  );
};

const Drawer = (ownProps: ComponentProps<typeof Popup> & ParentProps) => {
  let popoverEl: HTMLElement | null;
  // @screen(sm)
  const isDesktop = createMediaQuery('(max-width: 640px)');
  return (
    <Switch>
      <Match when={!isDesktop()}>
        <Popover {...ownProps} />
      </Match>
      <Match when={isDesktop()}>
        <Corvu.Root
          closeOnEscapeKeyDown={false}
          closeOnOutsidePointerDown={false}
          trapFocus={false}
          restoreFocus={false}
          role="dialog"
          onOpenChange={(open) => {
            // swiped away
            if (!open && popoverEl?.matches(':popover-open')) {
              popoverEl.hidePopover();
            }
          }}
        >
          <Content
            {...ownProps}
            ref={mergeRefs(ownProps.ref, (el: HTMLElement) => (popoverEl = el))}
          />
        </Corvu.Root>
      </Match>
    </Switch>
  );
};

export { Drawer };