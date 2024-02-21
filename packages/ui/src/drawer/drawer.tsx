import { createMediaQuery } from '@solid-primitives/media';
import { mergeRefs } from '@solid-primitives/refs';
import {
  createMemo,
  createSignal,
  Show,
  splitProps,
  type ComponentProps,
  type ValidComponent,
} from 'solid-js';
import Corvu from 'corvu/drawer';

import { Popover, type PopoverProps } from '../popover';
import { tw } from '../tw';
import { composeEventHandlers } from '../utils';

import cssStyles from './drawer.module.css';

const DrawerContent = <T extends ValidComponent = 'div'>(
  ownProps: PopoverProps<T>,
) => {
  const [open, setOpen] = createSignal(false);
  const [local, props] = splitProps(ownProps as PopoverProps<'div'>, [
    'children',
    'class',
  ]);
  let popoverEl: HTMLElement | null;

  const resolved = createMemo(() => {
    const child = local.children;
    return typeof child === 'function' ? child(open) : child;
  });

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
        // onOpenChange is executed on every state change, we only want to hide it
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
        ref={mergeRefs(ownProps.ref, (el: HTMLElement) => (popoverEl = el))}
      >
        <Show when={open()}>
          <div class="grid w-full place-content-center pb-3 pt-2">
            <div class="bg-on-surface/30 h-1 w-8 rounded-full" />
          </div>
          {resolved()}
        </Show>
      </Corvu.Content>
    </Corvu.Root>
  );
};

const Drawer = <T extends ValidComponent = 'div'>(
  ownProps: PopoverProps<T>,
) => {
  const isMobile = createMediaQuery(
    // @screen(sm)
    '(max-width: 640px)',
    true,
  );
  return (
    <Show
      when={isMobile()}
      children={<DrawerContent {...ownProps} />}
      fallback={<Popover {...ownProps} id={ownProps.id} />}
    />
  );
};

export { Drawer };
