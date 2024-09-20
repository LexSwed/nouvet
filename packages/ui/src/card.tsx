import { A, type AnchorProps } from "@solidjs/router";
import { type VariantProps, cva } from "class-variance-authority";
import { type ValidComponent, splitProps } from "solid-js";
import { Dynamic, type DynamicProps } from "solid-js/web";

import { tw } from "./tw";
import { mergeDefaultProps } from "./utils";

const cardVariants = cva("flex flex-col gap-2 rounded-2xl p-4", {
	variants: {
		_link: {
			true: "intent:outline-2 outline-offset-4 transition duration-200",
			false: "",
		},
		variant: {
			elevated: "bg-surface text-on-surface shadow-sm",
			flat: "bg-surface text-on-surface shadow-flat",
			tonal: "",
			outlined: "border border-outline/20 bg-surface text-on-surface",
		},
		tone: {
			neutral: "",
			primary: "",
			"primary-light": "",
			secondary: "",
			failure: "bg-error-container text-on-error-container",
		},
	},
	compoundVariants: [
		{
			variant: "tonal",
			tone: "primary",
			class: "bg-primary-container text-on-primary-container",
		},
		{
			_link: true,
			variant: "tonal",
			tone: "primary",
			class: "intent:filter-darker outline-primary",
		},
		{
			variant: "tonal",
			tone: "secondary",
			class: "bg-tertiary-container text-on-tertiary-container",
		},
		{
			_link: true,
			variant: "tonal",
			tone: "secondary",
			class: "intent:bg-tertiary-container outline-on-surface",
		},
		{
			variant: "tonal",
			tone: "primary-light",
			class: "bg-primary-container/30 text-on-primary-container",
		},
		{
			variant: "tonal",
			tone: "primary-light",
			_link: true,
			class: "intent:bg-primary-container/50 outline-primary",
		},
		{
			variant: "tonal",
			tone: "neutral",
			class: "bg-on-surface/5 text-on-surface",
		},
		{
			variant: "tonal",
			tone: "neutral",
			_link: true,
			class: "intent:bg-on-surface/8 outline-on-surface",
		},
		{
			variant: "flat",
			tone: "neutral",
			_link: true,
			class: "intent:bg-on-surface/8 outline-on-surface",
		},
	],
	defaultVariants: {
		tone: "neutral",
		variant: "flat",
	},
});

type CardVariants = Omit<VariantProps<typeof cardVariants>, "_link">;

type CardProps<T extends ValidComponent> = Omit<DynamicProps<T>, "component"> &
	CardVariants & {
		/** @default 'span' */
		as?: T | undefined;
	};

const Card = <T extends ValidComponent>(ownProps: CardProps<T>) => {
	const [local, props] = splitProps(ownProps, ["variant", "tone", "as"]);
	return (
		<Dynamic
			component={local.as || "div"}
			{...props}
			class={tw(cardVariants(local), props.class)}
		/>
	);
};

interface NavCardProps extends AnchorProps, CardVariants {
	/**
	 * @default 'filled'
	 */
	variant?: CardVariants["variant"];
}
export const NavCard = (ownProps: NavCardProps) => {
	const [local, props] = splitProps(
		mergeDefaultProps(ownProps, { variant: "tonal", tone: "primary" }),
		["variant", "tone"],
	);

	return (
		<A
			{...props}
			class={tw(
				cardVariants({ tone: local.tone, variant: local.variant, _link: true }),
				props.class,
			)}
		/>
	);
};

export { Card };
