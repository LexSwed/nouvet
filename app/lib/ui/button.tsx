import { cva, type VariantProps } from "class-variance-authority";
import { tw } from "./tw.ts";
import { Spinner } from "./spinner.tsx";
import type { ButtonHTMLAttributes } from "react";
import { Slot, type SlotProps } from "@radix-ui/react-slot";
import { Link, type LinkProps } from "@remix-run/react";

const buttonVariants = cva(
	"relative ring-offset-background focus-visible:ring-outline inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-on-primary intent:bg-primary/90 focus-visible:ring-primary",
				destructive:
					"bg-destructive text-on-destructive intent:bg-destructive/90",
				outline:
					"border-input bg-background intent:bg-accent intent:text-on-accent border",
				secondary: "bg-secondary text-on-secondary intent:bg-secondary/80",
				ghost: "intent:bg-accent intent:text-on-accent",
				link: "text-primary underline-offset-4 intent:underline",
			},
			size: {
				default: "h-12 min-w-12 px-4 py-2 text-base",
				sm: "h-10 min-w-10 rounded-md px-3 text-base",
				lg: "h-14 min-w-14 rounded-md px-8 text-lg",
				cta: "h-16 min-w-16 rounded-full px-8 text-lg",
			},
			loading: {
				true: "",
				false: "",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

const BaseComponent = ({
	size,
	loading,
	variant,
	className,
	onClick,
	children,
	...props
}: ButtonVariants & SlotProps) => {
	return <Slot {...props}>{children}</Slot>;
};

interface ButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		ButtonVariants {}

const Button = ({
	type = "button",
	size,
	loading,
	variant,
	className,
	onClick,
	children,
	...props
}: ButtonProps) => {
	return (
		<button
			type={type}
			{...props}
			className={tw(buttonVariants({ size, loading, variant }), className)}
			onClick={
				loading
					? (event) => {
							if (loading) {
								event.preventDefault();
								return;
							}
							onClick?.(event);
						}
					: onClick
			}
			aria-disabled={loading ? loading : undefined}
		>
			{children}
			{loading ? (
				<div className="absolute inset-0 z-20 flex cursor-default items-center justify-center rounded-[inherit] bg-[inherit]">
					<Spinner />
				</div>
			) : null}
		</button>
	);
};

export const ButtonLink = ({
	size,
	loading,
	variant,
	className,
	onClick,
	children,
	...props
}: ButtonVariants & LinkProps) => {
	return (
		<Link
			{...props}
			className={tw(buttonVariants({ size, loading, variant }), className)}
			onClick={
				loading
					? (event) => {
							if (loading) {
								event.preventDefault();
								return;
							}
							onClick?.(event);
						}
					: onClick
			}
			aria-disabled={loading ? loading : undefined}
		>
			{children}
			{loading ? (
				<div className="absolute inset-0 z-20 flex cursor-default items-center justify-center rounded-[inherit] bg-[inherit]">
					<Spinner />
				</div>
			) : null}
		</Link>
	);
};

export { Button };
