import { clsx } from "clsx";

import { cva, type VariantProps } from "class-variance-authority";
import type { SVGAttributes } from "react";

interface Props
	extends SVGAttributes<SVGElement>,
		VariantProps<typeof spinnerCss> {}

export const Spinner = ({ size, className, ...props }: Props) => {
	return (
		<svg
			{...props}
			className={clsx(spinnerCss({ size }), className)}
			viewBox="0 0 50 50"
			role="progressbar"
			aria-valuemin={0}
			aria-valuemax={100}
		>
			<circle
				cx="25"
				cy="25"
				r="20"
				fill="none"
				stroke-width="4"
				className="animate-spinner-circle stroke-current [stroke-linecap:round]"
			/>
		</svg>
	);
};
const spinnerCss = cva("animate-spin", {
	variants: {
		size: {
			base: "size-8",
			sm: "size-5",
			lg: "size-16",
			xl: "size-24",
		},
	},
	defaultVariants: {
		size: "base",
	},
});
