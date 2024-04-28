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
import { Content as DrawerContent, Root as DrawerRoot } from 'corvu/drawer';

import { Popover, type PopoverProps } from '../popover';
import { tw } from '../tw';
import { composeEventHandlers } from '../utils';

import cssStyles from './drawer.module.css';

const MobileDrawer = <T extends ValidComponent = 'div'>(
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
    <DrawerRoot
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
      <DrawerContent
        as="div"
        forceMount
        popover="auto"
        role="dialog"
        tabIndex={0}
        class={tw(cssStyles.drawer, local.class, 'max-w-[640px]')}
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
        {...(props as ComponentProps<typeof DrawerContent>)}
        ref={mergeRefs(ownProps.ref, (el: HTMLElement) => (popoverEl = el))}
      >
        <Show when={open()}>
          <div class="grid w-full place-content-center pb-3 pt-2">
            <div class="bg-on-surface/30 h-1 w-8 rounded-full" />
          </div>
          {resolved()}
        </Show>
      </DrawerContent>
    </DrawerRoot>
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
      children={<MobileDrawer {...ownProps} />}
      fallback={<Popover {...ownProps} />}
    />
  );
};

export { Drawer };
