import spriteHref from "@nou/config/icons/sprite.svg";
import { type VariantProps, cva } from "class-variance-authority";
import { type JSX, splitProps } from "solid-js";

import { tw } from "../tw";
import type { SvgIcons } from "./svg-icons.d.ts";

export type { SvgIcons } from "./svg-icons.d.ts";

const iconVariants = cva("inline-block shrink-0 select-none", {
	variants: {
		size: {
			font: "size-font",
			xs: "size-4",
			sm: "size-5",
			md: "size-8",
			lg: "size-16",
			xl: "size-24",
		},
	},
	defaultVariants: {
		size: "sm",
	},
});

export interface IconProps
	extends JSX.SvgSVGAttributes<SVGSVGElement>,
		VariantProps<typeof iconVariants> {
	use: SvgIcons;
}

const Icon = (ownProps: IconProps) => {
	const [local, props] = splitProps(ownProps, ["use", "size"]);
	return (
		// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
		<svg
			{...props}
			class={tw(iconVariants(local), props.class)}
			aria-hidden={!(props["aria-label"] || props["aria-labelledby"])}
		>
			<use href={`${spriteHref}#${local.use}`} />
		</svg>
	);
};

export { Icon };
