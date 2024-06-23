import { splitProps, type ComponentProps, type ValidComponent } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { cva, type VariantProps } from 'class-variance-authority';

import { tw } from '../tw';
import { mergeDefaultProps, type Merge } from '../utils';

import * as cssStyle from './menu.module.css';

const listItemVariants = cva(cssStyle.listItem, {
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

type ListItemProps<T extends ValidComponent> = Merge<
  ComponentProps<T>,
  VariantProps<typeof listItemVariants> & {
    /**
     * @default div
     */
    as?: T;
  }
>;

export const ListItem = <T extends ValidComponent = 'div'>(
  ownProps: ListItemProps<T>,
) => {
  const [local, props] = splitProps(
    mergeDefaultProps(ownProps as ListItemProps<'div'>, {
      as: 'div',
    }),
    ['as', 'tone', 'style', 'class'],
  );
  return (
    <Dynamic
      component={local.as}
      {...props}
      class={tw(listItemVariants({ tone: local.tone }), local.class)}
    />
  );
};
