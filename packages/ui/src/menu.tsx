import { type ComponentProps } from 'solid-js';
import { Button } from './button';
import * as cssStyle from './menu.module.css';
import { Popup } from './popup';
import { tw } from './tw';
import { composeEventHandlers } from './utils';

interface MenuTriggerProps extends ComponentProps<typeof Button> {
  /**
   * ID of the Popover element this trigger opens.
   */
  popoverTarget: string;
}
const MenuTrigger = (ownProps: MenuTriggerProps) => {
  return (
    <Button
      aria-haspopup="true"
      aria-controls={ownProps.popoverTarget}
      {...ownProps}
    />
  );
};

interface MenuProps extends Omit<ComponentProps<typeof Popup>, 'variant'> {}

const Menu = (ownProps: MenuProps) => {
  return (
    <Popup
      role="menu"
      variant="list"
      {...ownProps}
      onKeyDown={composeEventHandlers(ownProps.onKeyDown, (event) => {
        switch (event.key) {
          case 'ArrowDown':
          case 'ArrowUp': {
            const list =
              event.currentTarget.querySelectorAll<HTMLElement>(
                '[role="menuitem"]',
              );
            const focusedItemIndex = Array.from(list).findIndex(
              (item) => document.activeElement === item,
            );
            let newIndex: number;
            if (event.key === 'ArrowDown') {
              newIndex =
                focusedItemIndex + 1 < list.length ? focusedItemIndex + 1 : 0;
            } else {
              newIndex =
                focusedItemIndex > 0 ? focusedItemIndex - 1 : list.length - 1;
            }
            list.item(newIndex)?.focus();
            break;
          }
        }
      })}
    />
  );
};

interface MenuItemProps extends ComponentProps<'div'> {}

const MenuItem = (ownProps: MenuItemProps) => {
  return (
    <div
      role="menuitem"
      tabIndex={-1}
      {...ownProps}
      class={tw(cssStyle.listItem, ownProps.class)}
    />
  );
};

export { Menu, MenuTrigger, MenuItem };
