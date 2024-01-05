import { type ComponentProps } from 'solid-js';
import { Button } from '../button';
import { Popover } from '../popover/popover';
import { tw } from '../tw';
import { composeEventHandlers } from '../utils';
import * as cssStyle from './menu.module.css';

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

interface MenuProps
  extends Omit<ComponentProps<'div'>, 'children'>,
    Pick<ComponentProps<typeof Popover>, 'placement' | 'offset' | 'children'> {
  id: string;
}

const Menu = (ownProps: MenuProps) => {
  return <Popover variant="list" as={MenuList} {...ownProps} />;
};

interface MenuItemProps extends ComponentProps<'div'> {}

const MenuItem = (ownProps: MenuItemProps) => {
  return (
    <div
      role="menuitem"
      tabIndex={-1}
      {...ownProps}
      onClick={composeEventHandlers(ownProps.onClick, (event) => {
        if (event.defaultPrevented) return;
        const popover = event.currentTarget.closest('[popover]');
        if (popover) {
          (popover as HTMLDivElement).hidePopover();
        }
      })}
      // mix of keyboard and mouse usage can lead to weird visuals,
      // but I don't think this is important enough
      // onMouseEnter={composeEventHandlers(ownProps.onMouseEnter, (event) => {
      //   event.currentTarget.focus();
      // })}
      class={tw(cssStyle.listItem, ownProps.class)}
    />
  );
};

interface MenuListProps extends ComponentProps<'div'> {}

const MenuList = (ownProps: MenuListProps) => {
  return (
    <div
      role="menu"
      tabIndex={0}
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

export { Menu, MenuList, MenuTrigger, MenuItem };
