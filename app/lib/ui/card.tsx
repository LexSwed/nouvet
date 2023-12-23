import { Link, type LinkProps } from "@remix-run/react";
import { cva, type VariantProps } from "class-variance-authority";
import { tw } from "./tw.ts";
import type { HTMLAttributes } from "react";

const cardVariants = cva("rounded-lg p-6 transition-shadow", {
	variants: {
		_link: {
			true: "",
			false: "",
		},
		variant: {
			"elevated": "bg-surface-container text-on-surface",
			"flat": "bg-surface text-on-surface",
			"filled":
				"bg-secondary-container focus:outline-background text-on-secondary-container",
			"filled-secondary":
				"bg-tertiary-container focus:outline-background text-on-tertiary-container",
			"outlined": "bg-surface text-on-surface border border-outline/20",
		},
	},
	defaultVariants: {
		variant: "elevated",
	},
	compoundVariants: [
		{
			variant: "filled",
			_link: true,
			class: "intent:ring-8 intent:ring-secondary-container",
		},
		{
			variant: "filled-secondary",
			_link: true,
			class: "intent:ring-8 intent:ring-tertiary-container",
		},
	],
});

type CardVariants = Omit<VariantProps<typeof cardVariants>, "_link">;

interface CardProps extends HTMLAttributes<HTMLDivElement>, CardVariants {}

const Card = ({ variant, className, ...props }: CardProps) => (
	<div {...props} className={tw(cardVariants({ variant }), className)} />
);

interface NavCardProps extends LinkProps, CardVariants {
	/**
	 * @default 'filled'
	 */
	variant?: CardVariants["variant"];
}
export const NavCard = ({
	variant = "filled",
	className,
	...props
}: NavCardProps) => {
	return (
		<Link
			{...props}
			className={tw(cardVariants({ variant, _link: true }), className)}
		/>
	);
};

export { Card };
