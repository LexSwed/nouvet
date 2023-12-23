import { Link, type LinkProps } from "@remix-run/react";
import { cva, type VariantProps } from "class-variance-authority";
import { tw } from "./tw.ts";
import type { HTMLAttributes } from "react";

const cardVariants = cva("rounded-lg p-6 transition-shadow", {
	variants: {
		variant: {
			"elevated": "bg-surface-container text-on-surface",
			"flat": "bg-surface text-on-surface",
			"filled":
				"bg-secondary-container focus:outline-on-background text-on-secondary-container",
			"filled-secondary":
				"bg-tertiary-container focus:outline-on-background text-on-tertiary-container",
			"outlined": "bg-surface text-on-surface border border-outline/20",
		},
	},
	defaultVariants: {
		variant: "elevated",
	},
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
		<Link {...props} className={tw(cardVariants({ variant }), className)} />
	);
};

export { Card };
