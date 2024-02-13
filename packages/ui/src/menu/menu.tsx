import { type ComponentProps } from 'solid-js';

import { Popover } from '../popover';
import { tw } from '../tw';
import { composeEventHandlers } from '../utils';

import * as cssStyle from './menu.module.css';

interface MenuProps
  extends Omit<ComponentProps<'div'>, 'children' | 'role'>,
    Pick<
      ComponentProps<typeof Popover>,
      'placement' | 'offset' | 'strategy' | 'children'
    > {
  id: string;
}

const Menu = (ownProps: MenuProps) => {
  return <Popover role="menu" as={MenuList} {...ownProps} />;
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
      onMouseEnter={composeEventHandlers(ownProps.onMouseEnter, (event) => {
        event.currentTarget.focus();
      })}
      class={tw(cssStyle.listItem, ownProps.class)}
    />
  );
};

interface MenuListProps extends ComponentProps<'div'> {}

const MenuList = (ownProps: MenuListProps) => {
  return (
    <div
      tabIndex={0}
      role="menu"
      {...ownProps}
      class={tw('rounded-2xl', ownProps.class)}
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

export { Menu, MenuList, MenuItem };
