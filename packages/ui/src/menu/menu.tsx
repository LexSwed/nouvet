import {
  splitProps,
  type ComponentProps,
  type JSX,
  type ValidComponent,
} from 'solid-js';
import { cva, type VariantProps } from 'class-variance-authority';

import { Popover } from '../popover';
import { tw } from '../tw';
import { composeEventHandlers, mergeDefaultProps, type Merge } from '../utils';

import { ListItem } from './list-item';

import * as cssStyle from './menu.module.css';

interface MenuProps
  extends Omit<ComponentProps<'div'>, 'children' | 'style' | 'role'>,
    Pick<ComponentProps<typeof Popover>, 'placement' | 'style' | 'children'> {
  id: string;
}

const Menu = (ownProps: MenuProps) => {
  return <Popover role="menu" as={MenuList} {...ownProps} />;
};

const menuItemVariants = cva(cssStyle.listItem, {
  variants: {
    tone: {
      neutral: cssStyle.listItemNeutral,
      destructive: cssStyle.listItemDestructive,
    },
  },
  defaultVariants: {
    tone: 'neutral',
  },
});

type MenuItemProps<T extends ValidComponent> = Merge<
  ComponentProps<T>,
  VariantProps<typeof menuItemVariants> & {
    /**
     * @default div
     */
    as?: T;
    style?: JSX.CSSProperties;
  }
>;

const MenuItem = <T extends ValidComponent = 'div'>(
  ownProps: MenuItemProps<T>,
) => {
  const [local, props] = splitProps(
    mergeDefaultProps(ownProps as MenuItemProps<'div'>, {
      role: 'menuitem',
      as: 'div',
    }),
    ['style'],
  );
  return (
    <ListItem
      tabIndex={-1}
      {...props}
      style={
        'popoverTarget' in props
          ? ({
              ...local.style,
              'anchor-name': `--anchor-${props.popoverTarget}`,
            } satisfies JSX.CSSProperties)
          : local.style
      }
      onClick={composeEventHandlers(props.onClick, (event) => {
        if (
          event.defaultPrevented ||
          props.role !== 'menuitem' ||
          ('popoverTarget' in props && props.popoverTarget)
        )
          return;
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
