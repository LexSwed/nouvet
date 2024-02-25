import { splitProps, type ComponentProps, type ValidComponent } from 'solid-js';
import { Dynamic } from 'solid-js/web';

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

type MenuItemProps<T extends ValidComponent> = ComponentProps<T> & { as?: T };

const MenuItem = <T extends ValidComponent>(ownProps: MenuItemProps<T>) => {
  const [local, props] = splitProps(ownProps as MenuItemProps<'div'>, [
    'as',
    'class',
  ]);
  return (
    <Dynamic
      component={local.as || 'div'}
      role="menuitem"
      tabIndex={-1}
      {...props}
      onClick={composeEventHandlers(props.onClick, (event) => {
        if (event.defaultPrevented || props.role !== 'menuitem') return;
        const popover = (event.currentTarget as HTMLElement).closest(
          '[popover]',
        );
        if (popover) {
          (popover as HTMLDivElement).hidePopover();
        }
      })}
      onMouseEnter={composeEventHandlers(props.onMouseEnter, (event) => {
        if (event.defaultPrevented || props.role !== 'menuitem') return;
        (event.currentTarget as HTMLElement).focus();
      })}
      class={tw(cssStyle.listItem, local.class)}
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
