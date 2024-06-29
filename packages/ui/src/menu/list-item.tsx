import { type VariantProps, cva } from "class-variance-authority";
import { type ComponentProps, type ValidComponent, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { tw } from "../tw";
import { type Merge, mergeDefaultProps } from "../utils";

import css from "./menu.module.css";

const listItemVariants = cva(css.listItem, {
	variants: {
		tone: {
			neutral: css.listItemNeutral,
			destructive: css.listItemDestructive,
		},
	},
	defaultVariants: {
		tone: "neutral",
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

export const ListItem = <T extends ValidComponent = "div">(ownProps: ListItemProps<T>) => {
	const [local, props] = splitProps(
		mergeDefaultProps(ownProps as ListItemProps<"div">, {
			as: "div",
		}),
		["as", "tone", "style", "class"],
	);
	return (
		<Dynamic
			component={local.as}
			{...props}
			class={tw(listItemVariants({ tone: local.tone }), local.class)}
		/>
	);
};
